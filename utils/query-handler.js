// Environment agnostic search query handler
// Ensures that provided values are coherent,
// and if all is fine produces normalized query objects

'use strict';

var ensureArray    = require('es5-ext/array/valid-array')
  , customError    = require('es5-ext/error/custom')
  , ensureObject   = require('es5-ext/object/valid-object')
  , ensureCallable = require('es5-ext/object/valid-callable')
  , ensureString   = require('es5-ext/object/validate-stringifiable-value')
  , d              = require('d')
  , ee             = require('event-emitter')

  , create = Object.create;

var QueryHandler = module.exports = function (handlersList) {
	var takenNames = create(null);
	this._handlers = ensureArray(handlersList).map(function (conf) {
		var handler = {};
		ensureObject(conf);
		handler.name = ensureString(conf.name);
		if (!handler.name) throw new Error("Query name must not be empty");
		if (takenNames[handler.name]) throw new Error("Query name must be unique");
		takenNames[handler.name] = true;
		if (conf.ensure != null) handler.ensure = ensureCallable(conf.ensure);
		return handler;
	});
};

ee(Object.defineProperties(QueryHandler.prototype, {
	_resolveQueryValue: d(function (handler, value, resolvedQuery, query) {
		if (value != null) {
			if (value !== value.trim()) {
				throw customError("Query value with edge whitespace",
					{ queryHandler: handler, fixedQueryValue: value.trim() || null });
			}
			if (!value) throw customError("Empty value", { queryHandler: handler });
		}
		if (handler.ensure) {
			try {
				value = handler.ensure.call(this, value, resolvedQuery, query);
			} catch (e) {
				e.queryHandler = handler;
				throw e;
			}
		}
		return value;
	}),
	resolve: d(function (query) {
		var resolvedQuery = this._handlers.reduce(function (resolvedQuery, handler) {
			var value = this._resolveQueryValue(handler, query[handler.name], resolvedQuery, query);
			if (value != null) resolvedQuery[handler.name] = value;
			return resolvedQuery;
		}.bind(this), create(null));
		this.emit('query', resolvedQuery);
		return resolvedQuery;
	})
}));
