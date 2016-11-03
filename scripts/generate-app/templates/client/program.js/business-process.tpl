// Initialization of the "Business Process Submitted" application
// (it's the first module that gets loaded in a browser).

'use strict';

Error.stackTraceLimit = Infinity;

if (window.performance && window.performance.now) {
	console.log("Download & compilation:", (window.performance.now() / 1000).toFixed(3) + "s");
}
console.log("Build timestamp: ${BUILD_TIMESTAMP}");

var startTime = Date.now()
  , appName = '${ appName }';

// JavaScript polyfills and shims
// TODO: autodetect, generate and import from: './shims.generated'
require('mano/lib/client/implement-es');

// Assure Client id
// TODO: Require here strictly to log (there should be no log in imported module)
var clientId = require('mano/lib/client/client-id');

// Ensure time is in sync with server
require('eregistrations/client/time-sync');

// DOM bindings for observables
// TODO: Should not be here
require('mano/lib/observable-dom');

// Env settings
require('../../../apps-common/client/env');

// i18n2
require('../../../i18n');

// Expose for dev purposes
// TODO: Expose only in dev environments
var db = window.db = require('../../../db');
require('./model.generated');

var formClear = require('mano/lib/client/utils/form-status').clear.bind(document)
  , loadView, userId, server, inSync, isViewGenerated;

var runDbSync = function () {
	if (inSync && isViewGenerated) {
		if (typeof window.onDbSync === 'function') window.onDbSync();
	}
};

// DBJS DOM bindings setup
require('./dbjs-dom');

// Database persistent layer
require('mano/lib/client/local-storage-driver');

// Database Server -> Client propagation
require('mano/lib/client/sse-driver');

// Database Client -> Server propagation
server = require('mano/lib/client/server-sync');
server.once('sync-confirmed', function () {
	inSync = true;
	runDbSync();
});

// Database Client <-> Server sync issues resolver
require('mano/lib/client/sync-guard');

// Db update events on document
require('mano/lib/client/dom-app-events');

// Find authenticated user object
userId = require('dom-ext/html-document/#/get-cookie')
	.call(document, 'authenticated' + location.port);

if (userId) {
	localStorage._authenticated = userId;
} else {
	throw new Error('No data on authenticated user found. ' +
			'Make sure that url port matches one provided into url setting in env.js(on)');
}

loadView = function () {
	var appLocation  = window.appLocation = require('mano/lib/client/location')
	  , last             = require('es5-ext/string/#/last')
	  , DomjsSiteTree    = require('domjs-site-tree')
	  , SiteTreeRouter   = require('site-tree-router')
	  , postRouter       = require('mano/client/post-router')
	  , joinControllers  = require('mano/utils/join-controllers')
	  , isReadOnlyRender = require('mano/client/utils/is-read-only-render')
	  , user, refresh, viewContext;

	if (!document.body) {
		setTimeout(loadView, 0);
		return;
	}
	user = db.User.getById(userId);
	if (!user || !user.currentBusinessProcess ||
			((appName === 'business-process-submitted') &&
				!user.currentBusinessProcess.requirementUploads.dataSnapshot.resolved)) {
		server.once('sync', loadView);
		console.log(".. Waiting for user data ..");
		return;
	}
	Object.defineProperty(db, '$user', { configurable: true, value: user });
	viewContext = { appName: appName };
	if (isReadOnlyRender) {
		require('eregistrations/client/resolve-legacy-render-view-context')(db, clientId, viewContext);
	} else {
		viewContext.businessProcess = user.currentBusinessProcess;
		if (user.currentRoleResolved === 'manager') {
			viewContext.manager = user;
			viewContext.user = user.currentlyManagedUser;
		} else {
			viewContext.user = user;
		}
	}
	var siteTree = new DomjsSiteTree(require('mano/lib/client/domjs'));
	var siteTreeRouter = new SiteTreeRouter(require('../routes'), siteTree, {
		eventProto: viewContext,
		notFound: require('eregistrations/view/404')
	});

	postRouter(joinControllers(require('../controller'), require('../controller/client')),
		user);

	if (!isReadOnlyRender) require('eregistrations/client/reload-on-app-switch')(user);

	appLocation.on('change', refresh = function () {
		var result;
		if (last.call(appLocation.pathname) !== '/') {
			appLocation.goto(appLocation.pathname + '/' + appLocation.search + appLocation.hash);
			return;
		}
		result = siteTreeRouter.route(appLocation.pathname);
	if (result && (typeof result.done === 'function')) result.done();
	});
	if (appLocation.pathname) refresh();
	else appLocation.onchange();

	if (location.hash) appLocation.goto(location.pathname + location.search + location.hash);
	if (window.performance && window.performance.now) {
		console.log("Total load time:", (window.performance.now() / 1000).toFixed(3) + "s");
	} else {
		console.log("Application load time:", ((Date.now() - startTime) / 1000).toFixed(3) + "s");
	}
	siteTree.on('load', formClear);
	siteTree.on('load', function () { document.emit('pageload'); });
	document.addEventListener('submit', formClear, true);
	document.emit('mano:load');

	isViewGenerated = true;
	runDbSync();
};
if (localStorage._id) loadView();
else server.once('sync', loadView);
