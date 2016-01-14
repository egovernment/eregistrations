// It's about chain linked objects as e.g.:
//
// businessProcess -> derivedBusinessProcess -> derivedBusinessProcess
//
// So e.g. if we want whole chain we provide initial business process and then whole chain down
// to last derived (if any exist) is also resolved.

'use strict';

var ensureString  = require('es5-ext/object/validate-stringifiable-value')
  , deferred      = require('deferred')
  , memoize       = require('memoizee')
  , ObservableSet = require('observable-set/primitive')
  , dbDriver      = require('mano').dbDriver

  , isArray = Array.isArray;

var observe = function (set, storages, ownerId, keyPath) {
	var id = ownerId + '/' + keyPath, listener, child, promise;
	var handler = function (data) {
		var value = data && data.value
		  , nu = (value && (value[0] === '7')) ? value.slice(1) : null
		  , old = child ? child.id : null;
		if (nu === old) return;
		if (old) {
			set.delete(old);
			child.clear();
		}
		if (nu) {
			set.add(nu);
			child = observe(set, storages, nu, keyPath);
			return child.promise;
		}
	};
	listener = function (event) { handler(event.data); };
	storages.forEach(function (storage) { storage.on('keyid:' + id, listener); });
	promise = deferred.some(storages, function (storage) {
		return storage.get(id)(function (data) {
			if (data) handler(data)(true);
		});
	});
	return {
		id: ownerId,
		promise: promise,
		clear: function () {
			storages.forEach(function (storage) { storage.off('keyid:' + id, listener); });
			if (child) {
				set.delete(child.id);
				child.clear();
			}
		}
	};
};

module.exports = memoize(function (storageName, ownerId, keyPath) {
	var set, storages = [];
	if (isArray(storageName)) {
		storageName.forEach(function (storageName) {
			storages.push(dbDriver.getStorage(ensureString(storageName)));
		});
	} else {
		storages.push(dbDriver.getStorage(ensureString(storageName)));
	}
	ownerId = ensureString(ownerId);
	keyPath = ensureString(keyPath);
	set = new ObservableSet();
	set.promise = observe(set, storages, ownerId, keyPath).promise;
	return set;
}, { primitive: true });
