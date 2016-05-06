// Initializes prototype application client runtime

'use strict';

var isReadOnlyRender = require('mano/client/utils/is-read-only-render');

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
var db = window.db = require('../../db');

mano.noData = true;

// DB Model
require('./model');

// DB DOM bindings
// TODO: autodetect, generate and import from ./dbjs-dom.generated
require('./dbjs-dom');

var appLocation    = window.appLocation = require('mano/lib/client/location')
  , last           = require('es5-ext/string/#/last')
  , postRouter     = require('mano/client/post-router')
  , DomjsSiteTree  = require('domjs-site-tree')
  , SiteTreeRouter = require('site-tree-router');

// Supress form submissions, but do not provide any form controllers
postRouter({});

if (isReadOnlyRender) require('site-tree/lib/assure-seamless-styles').enabled = false;

var siteTree = new DomjsSiteTree(require('mano/lib/client/domjs'));
router = new SiteTreeRouter(require('../routes'), siteTree, {
	notFound: require('../../view/404'),
	eventProto: { user: db.userVianney, businessProcess: db.firstBusinessProcess,
		processingStep: db.firstBusinessProcess.processingSteps.map.revision  }
});
appLocation.on('change', function () {
	var result;
	if (last.call(appLocation.pathname) !== '/') {
		appLocation.goto(appLocation.pathname + '/' + appLocation.search + appLocation.hash);
		return;
	}
	result = router.route(appLocation.pathname);
	if (result && (typeof result.done === 'function')) result.done();
});
appLocation.onchange();

if (location.hash) appLocation.goto(location.pathname + location.search + location.hash);
if (window.performance && window.performance.now) {
	console.log("Total load time:", (window.performance.now() / 1000).toFixed(3) + "s");
} else {
	console.log("Application load time:", ((Date.now() - startTime) / 1000).toFixed(3) + "s");
}
if (typeof window.onDbSync === 'function') window.onDbSync();
