'use strict';

var ensureArray   = require('es5-ext/array/valid-array')
  , ensureString  = require('es5-ext/object/validate-stringifiable-value')
  , memoize       = require('memoizee')
  , Map           = require('es6-map')
  , deferred      = require('deferred')
  , ensureStorage = require('dbjs-persistence/ensure-storage');

module.exports = memoize(function (storages) {
	var map = new Map(), unresolved = new Map();
	var setStorage = function (id, storage) {
		var def;
		if (map.has(id)) return;
		map.set(id, deferred(storage));
		def = unresolved.get(id);
		if (def) {
			def.resolve(storage);
			unresolved.delete(id);
		}
	};
	storages.forEach(function (storage) {
		storage.on('update', function (event) { return setStorage(event.ownerId, storage); });
	});
	var resolve = function (id) {
		var def;
		if (unresolved.has(id)) return unresolved.get(id).promise;
		def = deferred();
		unresolved.set(id, def);
		deferred.find(storages, function (storage) {
			return storage.get(id);
		}).done(function (storage) {
			if (!storage) {
				def.resolve(null);
				return;
			}
			map.set(id, deferred(storage));
			unresolved.delete(def);
			def.resolve(storage);
		}, def.reject);
		return def.promise;
	};
	var getId = function (id) {
		id = ensureString(id);
		return map.get(id) || resolve(id);
	};
	getId.setStorage = setStorage;
	return getId;
}, { primitive: true, normalizer: function (args) {
	return ensureArray(args[0]).map(function (storage) {
		return ensureStorage(storage).name;
	}).sort().join();
} });
