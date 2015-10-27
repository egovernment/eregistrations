// Initializes public application client runtime (WIP)

'use strict';

Error.stackTraceLimit = Infinity;

if (window.performance && window.performance.now) {
	console.log("Download & compilation:", (window.performance.now() / 1000).toFixed(3) + "s");
}
console.log("Build timestamp: ${BUILD_TIMESTAMP}");

var startTime = Date.now(), mano;

// JavaScript polyfills and shims
// TODO: autodetect, generate and import from: './shims.generated'
require('mano/lib/client/implement-es');

// Assure Client id
// TODO: Require here strictly to log (there should be no log in imported module)
require('mano/lib/client/client-id');

mano = require('mano');
// Expose for dev purposes
// TODO: Expose only in dev environments
window.db = mano.db;

// i18n2
var env = require('../../../apps-common/client-env');
mano.i18n = require('i18n2')(require('mano/client/utils/resolve-locale')(env,
	require('../../../i18n')));

// DB Model
require('./model.generated');

// DB DOM bindings
// TODO: autodetect, generate and import from ./dbjs-dom.generated
require('./dbjs-dom');

// Database persistent layer
require('mano/lib/client/local-storage-driver');

// Database Server -> Client propagation
require('mano/lib/client/sse-driver');

// Database Client -> Server propagation
require('mano/lib/client/server-sync');

// Database Client <-> Server sync issues resolver
require('mano/lib/client/sync-guard');

var appLocation     = window.appLocation = require('mano/lib/client/location')
  , postRouter      = require('mano/client/post-router')
  , joinControllers = require('mano/utils/join-controllers')
  , formClear       = require('mano/lib/client/utils/form-status').clear.bind(document)
  , last            = require('es5-ext/string/#/last')
  , SiteTree        = require('html-site-tree')
  , SiteTreeRouter  = require('site-tree-router')

  , viewTree, router, refresh;

mano.env = env;

// Intialize POST router & controller
postRouter(joinControllers(require('../controller'), require('../controller/client')));

// Clear localStorage
delete localStorage._authenticated;

// Gather loaded scripts
var loadedScripts = [];
Array.prototype.forEach.call(document.scripts, function (script) {
	if (script.src) loadedScripts.push(script.src);
});

// Intialize GET router & controller
require('mano/lib/client/domjs');
viewTree = new SiteTree(document, require('../view/inserts'),
	{ reEvaluateScripts: { ignoredSources: loadedScripts } });
router = new SiteTreeRouter(require('../routes'), viewTree,
	{ notFound: require('../view').notFound });
appLocation.on('change', refresh = function () {
	if (last.call(appLocation.pathname) !== '/') {
		appLocation.goto(appLocation.pathname + '/' + appLocation.search + appLocation.hash);
		return;
	}
	router.route(appLocation.pathname);
});
if (appLocation.pathname) refresh();
else appLocation.onchange();

if (location.hash) appLocation.goto(location.pathname + location.search + location.hash);

if (window.performance && window.performance.now) {
	console.log("Total load time:", (window.performance.now() / 1000).toFixed(3) + "s");
} else {
	console.log("Application load time:", ((Date.now() - startTime) / 1000).toFixed(3) + "s");
}
viewTree.on('load', formClear);
document.addEventListener('submit', formClear, true);
if (typeof window.onDbSync === 'function') window.onDbSync();
