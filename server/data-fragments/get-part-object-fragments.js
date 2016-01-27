// Returns fragment generator, where each returned fragment emits selected data for specified object

'use strict';

var aFrom           = require('es5-ext/array/from')
  , ensureString    = require('es5-ext/object/validate-stringifiable-value')
  , ensureSet       = require('es6-set/valid-set')
  , deferred        = require('deferred')
  , memoize         = require('memoizee/plain')
  , Fragment        = require('data-fragment')
  , assimilateEvent = require('./lib/assimilate-driver-event')
  , anyIdToStorage  = require('../utils/any-id-to-storage')

  , driver = require('mano').dbDriver;

module.exports = function (storageName, keyPaths) {
	var keyPathsArray, storage, storagePromise;
	if (storageName != null) {
		storage = driver.getStorage(ensureString(storageName));
		storagePromise = deferred(storage);
	}

	ensureSet(keyPaths);

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
				if (!event.keyPath || keyPaths.has(event.keyPath)) {
					if (event.type === 'direct') fragment.update(event.id, event.data);
					else assimilateEvent(fragment, event.id, event.data);
				}
			});
			return deferred(
				storage.get(ownerId)(function (data) {
					if (data) fragment.update(ownerId, data);
				}),
				storage.getObject(ownerId, { keyPaths: keyPaths })(function (data) {
					data.forEach(function (data) { fragment.update(data.id, data.data); });
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
