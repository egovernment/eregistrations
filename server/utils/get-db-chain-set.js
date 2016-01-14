// It's about chain linked objects as e.g.:
//
// businessProcess -> derivedBusinessProcess -> derivedBusinessProcess
//
// So e.g. if we want whole chain we provide initial business process and then whole chain down
// to last derived (if any exist) is also resolved.

'use strict';

var ensureString  = require('es5-ext/object/validate-stringifiable-value')
  , memoize       = require('memoizee')
  , ObservableSet = require('observable-set/primitive')
  , dbDriver      = require('mano').dbDriver;

var observe = function (set, storage, ownerId, keyPath) {
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
			child = observe(set, storage, nu, keyPath);
			return child.promise;
		}
	};
	storage.on('keyid:' + id, listener = function (event) { handler(event.data); });
	promise = storage.get(id)(handler);
	return {
		id: ownerId,
		promise: promise,
		clear: function () {
			storage.off('keyid:' + id, listener);
			if (child) {
				set.delete(child.id);
				child.clear();
			}
		}
	};
};

module.exports = memoize(function (storageName, ownerId, keyPath) {
	var set, storage = dbDriver.getStorage(storageName);
	ownerId = ensureString(ownerId);
	keyPath = ensureString(keyPath);
	set = new ObservableSet();
	set.promise = observe(set, storage, ownerId, keyPath).promise;
	return set;
}, { primitive: true });
