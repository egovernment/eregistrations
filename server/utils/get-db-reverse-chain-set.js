// It's about reverse chain of linked objects
//
// e.g. we may have
// businessProcess -> derivedBusinessProcess -> (last) derivedBusinessProcess
//
// Now this util for provided (last) derivedBusinessProcess will retrieve whole chain up to top

'use strict';

var ensureString  = require('es5-ext/object/validate-stringifiable-value')
  , deferred      = require('deferred')
  , memoize       = require('memoizee')
  , ObservableSet = require('observable-set/primitive')
  , dbDriver      = require('mano').dbDriver

  , isArray = Array.isArray;

var observe = function (set, storages, ownerId, keyPath) {
	var listener, child, promise;
	var handler = function (id, data, oldData) {
		var nu, old;
		if (oldData && (data.value === oldData.value)) return;
		if (data.value !== ('7' + ownerId)) {
			if (!oldData) return;
			if (oldData.value !== ('7' + ownerId)) return;
			nu = null;
		} else {
			nu = id.split('/', 1)[0];
		}
		old = child ? child.id : null;
		if (nu === old) return true;
		if (old) {
			set.delete(old);
			child.clear();
		}
		if (!nu) return true;
		set.add(nu);
		child = observe(set, storages, nu, keyPath);
		return child.promise(true);
	};
	listener = function (event) {
		if (event.type !== 'direct') return;
		handler(event.id, event.data, event.old);
	};
	storages.forEach(function (storage) { storage.on('key:' + keyPath, listener); });
	promise = deferred.some(storages, function (storage) {
		return storage.search(keyPath, handler);
	});
	return {
		id: ownerId,
		promise: promise,
		clear: function () {
			storages.forEach(function (storage) { storage.off('key:' + keyPath, listener); });
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
