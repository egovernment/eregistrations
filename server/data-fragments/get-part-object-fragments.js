// Returns fragment generator, where each returned fragment emits selected data for specified object

'use strict';

var aFrom           = require('es5-ext/array/from')
  , ensureIterable  = require('es5-ext/iterable/validate-object')
  , ensureString    = require('es5-ext/object/validate-stringifiable-value')
  , Set             = require('es6-set')
  , deferred        = require('deferred')
  , memoize         = require('memoizee/plain')
  , Fragment        = require('data-fragment')
  , resolveKeyPath  = require('dbjs/_setup/utils/resolve-key-path')
  , ensureStorage   = require('dbjs-persistence/ensure-storage')
  , assimilateEvent = require('./lib/assimilate-driver-event')
  , anyIdToStorage  = require('../utils/any-id-to-storage');

module.exports = function (storage, keyPaths) {
	var keyPathsArray, storagePromise;
	if (storage != null) storagePromise = deferred(ensureStorage(storage));

	keyPaths = new Set(aFrom(ensureIterable(keyPaths)));
	keyPathsArray = aFrom(keyPaths);

	return memoize(function (ownerId) {
		var fragment, promise;
		ownerId = ensureString(ownerId);
		fragment = new Fragment();
		if (storage) promise = storagePromise;
		else promise = anyIdToStorage(ownerId);
		fragment.promise = promise(function (storage) {
			storage.on('owner:' + ownerId, function (event) {
				if (event.type === 'reduced') return;
				if (!event.keyPath || keyPaths.has(event.path) || keyPaths.has(event.keyPath)) {
					if (event.type === 'direct') fragment.update(event.id, event.data);
					else assimilateEvent(fragment, event.id, event.data);
				}
			});
			return deferred(
				storage.getObject(ownerId)(function (data) {
					data.forEach(function (data) {
						var path = (data.id === ownerId) ? null : data.id.slice(data.id.indexOf('/') + 1)
						  , keyPath = path ? resolveKeyPath(data.id) : null;
						if (path && !keyPaths.has(path) && !keyPaths.has(keyPath)) return;
						fragment.update(data.id, data.data);
					});
				}),
				deferred.map(keyPathsArray, function (keyPath) {
					var id = ownerId + '/' + keyPath;
					return storage.getComputed(id)(function (data) {
						if (!data) return;
						assimilateEvent(fragment, id, data);
					});
				})
			);
		});
		return fragment;
	});
};
