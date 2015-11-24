// Handle search query states
// Listens for changes in query string, then ensures that provided values are coherent,
// and if all is fine emits valid query objects
// (which are usually consumed by list managers to update state of tables)

'use strict';

var ensureObject     = require('es5-ext/object/valid-object')
  , ensureString     = require('es5-ext/object/validate-stringifiable-value')
  , once             = require('timers-ext/once')
  , fixLocationQuery = require('./fix-location-query')
  , QueryHandler     = require('./query-handler');

module.exports = function (handlersList, appLocation, pathname) {
	var queryHandler, update;
	appLocation = ensureObject(appLocation);
	pathname = ensureString(pathname);
	queryHandler = new QueryHandler(handlersList);
	queryHandler.update = update = once(function () {
		if (pathname !== appLocation.pathname) return;
		queryHandler.resolve(appLocation.query).catch(function (e) {
			if (!e.queryHandler) throw e;
			console.error("Invalid query value: " + e.message);
			fixLocationQuery(e.queryHandler.name, e.fixedQueryValue);
			return;
		});
	});
	queryHandler._handlers.forEach(function (handler) {
		appLocation.query.get(handler.name).on('change', update);
	});
	appLocation.on('change', update);
	update();
	return queryHandler;
};
