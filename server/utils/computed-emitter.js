'use strict';

var assign         = require('es5-ext/object/assign')
  , ensureString   = require('es5-ext/object/validate-stringifiable-value')
  , Map            = require('es6-map')
  , d              = require('d')
  , lazy           = require('d/lazy')
  , ee             = require('event-emitter')
  , deferred       = require('deferred')
  , memoizeMethods = require('memoizee/methods-plain')
  , dbDriver       = require('mano').dbDriver;

var ComputedEmitter = module.exports = function (dbName, keyPath) {
	if (!(this instanceof ComputedEmitter)) return new ComputedEmitter(dbName, keyPath);
	this._dbName = ensureString(dbName);
	this._keyPath = ensureString(keyPath);

	dbDriver.on('computed:' + keyPath, function (event) {
		this._map.set(event.ownerId, event.data.value);
		this.emit(event.ownerId, event.data.value);
	}.bind(this));
};

ee(Object.defineProperties(ComputedEmitter.prototype, assign({
	get: function (ownerId) {
		if (this._map.has(ownerId)) return deferred(this._map.get(ownerId));
		return this._getData(ownerId);
	}
}, memoizeMethods({
	_getData: d(function (ownerId) {
		return dbDriver.getComputed(ownerId + '/' + this._keyPath)(function (data) {
			var value = data ? data.value : '';
			this._map.set(ownerId, value);
			return value;
		}.bind(this));
	})
}), lazy({
	_map: d(function () { return new Map(); })
}))));
