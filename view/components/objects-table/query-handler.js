// Handle search query states
// Listens for changes in query string, then ensures that provided values are coherent,
// and if all is fine emits valid query objects
// (which are usually consumed by list managers to update state of tables)

'use strict';

var ensureArray      = require('es5-ext/array/valid-array')
  , assign           = require('es5-ext/object/assign')
  , ensureObject     = require('es5-ext/object/valid-object')
  , ensureCallable   = require('es5-ext/object/valid-callable')
  , ensureString     = require('es5-ext/object/validate-stringifiable-value')
  , d                = require('d')
  , lazy             = require('d/lazy')
  , ee               = require('event-emitter')
  , once             = require('timers-ext/once')
  , fixLocationQuery = require('../../../utils/fix-location-query')

  , create = Object.create;

var QueryHandler = module.exports = function (handlersList, appLocation, pathname) {
	var takenNames = create(null);
	this._appLocation = ensureObject(appLocation);
	this._pathname = ensureString(pathname);
	this._handlers = ensureArray(handlersList).map(function (conf) {
		var handler = {};
		ensureObject(conf);
		handler.name = ensureString(conf.name);
		if (!handler.name) throw new Error("Query name must not be empty");
		if (takenNames[handler.name]) throw new Error("Query name must be unique");
		takenNames[handler.name] = true;
		if (conf.ensure != null) handler.ensure = ensureCallable(conf.ensure);
		if (conf.resolve != null) handler.resolve = ensureCallable(conf.resolve);
		return handler;
	});
	this._handlers.forEach(function (handler) {
		handler.observable = appLocation.query.get(handler.name);
		handler.observable.on('change', this.update);
	}, this);
	this._appLocation.on('change', this.update);
};

ee(Object.defineProperties(QueryHandler.prototype, assign({
	_processHandler: d(function (handler, query) {
		var value = handler.observable.value;
		if (value == null) {
			if (handler.resolve) {
				value = handler.resolve.call(this, value);
				if (value != null) query[handler.name] = value;
			}
			return true;
		}
		if (value !== value.trim()) {
			fixLocationQuery(handler.name, value.trim());
			return false;
		}
		if (!value) {
			fixLocationQuery(handler.name);
			return false;
		}
		if (handler.ensure) {
			try {
				value = handler.ensure.call(this, value) || value;
			} catch (e) {
				console.error(e.stack);
				fixLocationQuery(handler.name);
				return false;
			}
		}
		if (!handler.resolve) query[handler.name] = value;
		else query[handler.name] = handler.resolve.call(this, value);
		return true;
	})
}, lazy({
	update: d(function () {
		return once(function () {
			var query;
			if (this._pathname !== this._appLocation.pathname) return;
			query = create(null);
			if (!this._handlers.every(function (handler) {
					return this._processHandler(handler, query);
				}, this)) {
				return;
			}
			this.emit('query', query);
		}.bind(this));
	})
}))));
