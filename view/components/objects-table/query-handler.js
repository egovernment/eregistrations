// Handle search query states
// Listens for changes in query string, then ensures that provided values are coherent,
// and if all is fine emits valid query objects
// (which are usually consumed by list managers to update state of tables)

'use strict';

var ensureObject     = require('es5-ext/object/valid-object')
  , ensureString     = require('es5-ext/object/validate-stringifiable-value')
  , d                = require('d')
  , lazy             = require('d/lazy')
  , ee               = require('event-emitter')
  , once             = require('timers-ext/once')
  , fixLocationQuery = require('../../../utils/fix-location-query')
  , QueryHandler     = require('../../../utils/query-handler');

var QueryClientHandler = module.exports = function (handlersList, appLocation, pathname) {
	this._queryHandler = new QueryHandler(handlersList);
	this._appLocation = ensureObject(appLocation);
	this._pathname = ensureString(pathname);
	this._queryHandler._handlers.forEach(function (handler) {
		appLocation.query.get(handler.name).on('change', this.update);
	}, this);
	this._appLocation.on('change', this.update);
};

ee(Object.defineProperties(QueryClientHandler.prototype, lazy({
	update: d(function () {
		return once(function () {
			var query;
			if (this._pathname !== this._appLocation.pathname) return;
			try {
				query = this._queryHandler.resolve(this._appLocation.query);
			} catch (e) {
				if (!e.queryHandler) throw e;
				fixLocationQuery(e.queryHandler.name, e.fixedQueryValue);
				return;
			}
			this.emit('query', query);
		}.bind(this));
	})
})));
