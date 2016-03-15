// Returns fragment generator, where each returned fragment emits selected indexed data for
// specified object

'use strict';

var includes        = require('es5-ext/array/#/contains')
  , aFrom           = require('es5-ext/array/from')
  , deferred        = require('deferred')
  , ensureSet       = require('es6-set/valid-set')
  , ensureStorage   = require('dbjs-persistence/ensure-storage')
  , Fragment        = require('data-fragment')
  , assimilateEvent = require('./lib/assimilate-driver-event');

module.exports = function (storage, keyPaths) {
	var fragments = Object.create(null);

	ensureStorage(storage);
	keyPaths = aFrom(ensureSet(keyPaths));

	return function (objId) {
		var fragment = fragments[objId];
		if (fragment) return fragment;
		fragment = fragments[objId] = new Fragment();
		fragment.promise = storage.get(objId)(function (data) {
			if (data) fragment.update(objId, data);
			return deferred.map(keyPaths, function (keyPath) {
				return storage.getComputed(objId + '/' + keyPath)(function (data) {
					if (data) assimilateEvent(fragment, objId + '/' + keyPath, data);
				});
			});
		});
		storage.on('owner:' + objId, function (event) {
			if (event.type === 'direct') return;
			if (includes.call(keyPaths, event.keyPath)) {
				assimilateEvent(fragment, objId + '/' + event.keyPath, event.data);
			}
		});
		return fragment;
	};
};
