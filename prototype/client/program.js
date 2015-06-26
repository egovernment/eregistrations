// Initializes prototype application client runtime

'use strict';

Error.stackTraceLimit = Infinity;

if (window.performance && window.performance.now) {
	console.log("Download & compilation:", (window.performance.now() / 1000).toFixed(3) + "s");
}
console.log("Build timestamp: ${BUILD_TIMESTAMP}");

var startTime = Date.now(), mano, router;

// JavaScript polyfills and shims
// TODO: autodetect, generate and import from: './shims.generated'
require('mano/lib/client/implement-es');

// Assure Client id
// TODO: Require here strictly to log (there should be no log in imported module)
require('mano/lib/client/client-id');

// DOM bindings for observables
// TODO: Should not be here
require('mano/lib/observable-dom');

mano = require('mano');
mano.env = require('../../common/client/env');

// Expose for dev purposes
// TODO: Expose only in dev environments
window.db = mano.db;

mano.noData = true;

// DB Model
require('./model');

// DB DOM bindings
// TODO: autodetect, generate and import from ./dbjs-dom.generated
require('./dbjs-dom');

// Location controller & router
router = require('mano/lib/client/router')({ useNewPostController: true });

var appLocation = window.appLocation = require('mano/lib/client/location')
  , postRouter  = require('mano/client/post-router')
  , view;

// Supress form submissions, but do not provide any form controllers
postRouter({});

var loadView = function () {
	if (!document.body) {
		setTimeout(loadView, 0);
		return;
	}
	view = require('mano/lib/client/view')(require('../../view/prototype/_require'));
	router.get = require('../../view/prototype/_routes')(view);

	router.update();
	if (location.hash) appLocation.goto(location.pathname + location.search + location.hash);
	if (window.performance && window.performance.now) {
		console.log("Total load time:", (window.performance.now() / 1000).toFixed(3) + "s");
	} else {
		console.log("Application load time:", ((Date.now() - startTime) / 1000).toFixed(3) + "s");
	}
	if (typeof window.onDbSync === 'function') window.onDbSync();
};
loadView();
