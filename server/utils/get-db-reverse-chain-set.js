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
  , ensureStorage = require('dbjs-persistence/ensure-storage')

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
		var promises = [];
		return storage.search(keyPath, function (id, data) {
			var result = handler(id, data);
			promises.push(result);
			return result;
		})(function () { return deferred.map(promises); });
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

module.exports = memoize(function (storage, ownerId, keyPath) {
	var set, storages;
	if (isArray(storage)) storages = storage.map(ensureStorage);
	else storages = [ensureStorage(storage)];

	ownerId = ensureString(ownerId);
	keyPath = ensureString(keyPath);
	set = new ObservableSet();
	set.promise = observe(set, storages, ownerId, keyPath).promise;
	return set;
}, { primitive: true });
