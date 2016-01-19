'use strict';

var ensureArray   = require('es5-ext/array/valid-array')
  , ensureString  = require('es5-ext/object/validate-stringifiable-value')
  , memoize       = require('memoizee')
  , Map           = require('es6-map')
  , deferred      = require('deferred')
  , ensureStorage = require('dbjs-persistence/ensure-storage');

module.exports = memoize(function (storages) {
	var map = new Map(), unresolved = new Map();
	storages.forEach(function (storage) {
		storage.on('update', function (event) {
			var def;
			if (map.has(event.ownerId)) return;
			map.set(event.ownerId, deferred(storage));
			def = unresolved.get(event.ownerId);
			if (def) {
				def.resolve(storage);
				unresolved.delete(event.ownerId);
			}
		});
	});
	var resolve = function (id) {
		var def;
		if (unresolved.has(id)) return unresolved.get(id).promise;
		def = deferred();
		unresolved.set(id, def);
		deferred.find(storages, function (storage) { return storage.get(id); })
			.done(function (storage) {
				if (!storage) return;
				map.set(id, storage);
				unresolved.delete(def);
				def.resolve(storage);
			}, def.reject);
		return def.promise;
	};
	return function (id) {
		id = ensureString(id);
		return map.get(id) || resolve(id);
	};
}, { primitive: true, normalizer: function (args) {
	return ensureArray(args[0]).map(function (storage) {
		return ensureStorage(storage).name;
	}).sort().join();
} });
