'use strict';

var assign         = require('es5-ext/object/assign')
  , ensureString   = require('es5-ext/object/validate-stringifiable-value')
  , capitalize     = require('es5-ext/string/#/capitalize')
  , Map            = require('es6-map')
  , d              = require('d')
  , lazy           = require('d/lazy')
  , ee             = require('event-emitter')
  , deferred       = require('deferred')
  , memoizeMethods = require('memoizee/methods-plain')
  , ensureStorage  = require('dbjs-persistence/ensure-storage')

  , stringify = JSON.stringify;

var ComputedEmitter = module.exports = function (storage, keyPath/*, options*/) {
	var options;
	if (!(this instanceof ComputedEmitter)) {
		return new ComputedEmitter(storage, keyPath, arguments[2]);
	}
	options = Object(arguments[2]);
	this._storage = ensureStorage(storage);
	if (options.type != null) {
		if (options.type === 'direct') {
			this._type = 'direct';
		} else if (options.type !== 'computed') {
			throw new Error("Unrecognized type option: " + stringify(options.type));
		}
	}
	if ((keyPath != null) || (options.type !== 'direct')) {
		this._keyPath = ensureString(keyPath);
	}

	this._storage.on('key:' + keyPath || '&', function (event) {
		this._map.set(event.ownerId, event.data.value);
		this.emit(event.ownerId, event.data.value);
	}.bind(this));
};

ee(Object.defineProperties(ComputedEmitter.prototype, assign({
	_type: d('computed'),
	get: d(function (ownerId) {
		if (this._map.has(ownerId)) return deferred(this._map.get(ownerId));
		return this._getData(ownerId);
	})
}, memoizeMethods({
	_getData: d(function (ownerId) {
		var methodName = 'get' + ((this._type === 'direct') ? '' : capitalize.call(this._type))
		  , id = ownerId + (this._keyPath ? '/' + this._keyPath : '');
		return this._storage[methodName](id)(function (data) {
			var value = data ? data.value : '';
			this._map.set(ownerId, value);
			return value;
		}.bind(this));
	})
}), lazy({
	_map: d(function () { return new Map(); })
}))));
