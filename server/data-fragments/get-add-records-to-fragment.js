// Returns fragment generator, where each returned fragment emits selected data for specified object

'use strict';

var aFrom           = require('es5-ext/array/from')
  , ensureString    = require('es5-ext/object/validate-stringifiable-value')
  , ensureSet       = require('es6-set/valid-set')
  , deferred        = require('deferred')
  , assimilateEvent = require('./lib/assimilate-driver-event')

  , driver = require('mano').dbDriver;

module.exports = function (storageName, keyPaths) {
	var keyPathsArray, storage = driver.getStorage(ensureString(storageName));
	ensureSet(keyPaths);

	keyPathsArray = aFrom(keyPaths);

	return function (ownerId, fragment) {
		ownerId = ensureString(ownerId);
		fragment.promise = deferred(
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
		storage.on('owner:' + ownerId, function (event) {
			if (event.type === 'reduced') return;
			if (keyPaths.has(event.keyPath)) {
				if (event.type === 'direct') fragment.update(event.id, event.data);
				else assimilateEvent(fragment, event.id, event.data);
			}
		});
		return fragment;
	};
};
