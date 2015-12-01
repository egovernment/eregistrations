// Returns observable set of objects for given constraints

'use strict';

var ensureString  = require('es5-ext/object/validate-stringifiable-value')
  , memoize       = require('memoizee')
  , ObservableSet = require('observable-set/primitive')
  , dbDriver      = require('mano').dbDriver;

var observe = function (set, dbName, ownerId, keyPath) {
	var id = ownerId + '/' + keyPath, listener, child, promise;
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
		if (nu === old) return;
		if (old) {
			set.delete(old);
			child.clear();
		}
		if (nu) {
			set.add(nu);
			child = observe(set, dbName, nu, keyPath);
			return child.promise;
		}
	};
	dbDriver.on('direct:' + keyPath, listener = function (event) {
		handler(event.id, event.data, event.old);
	});
	promise = dbDriver.searchDirect(keyPath, handler);
	return {
		id: ownerId,
		promise: promise,
		clear: function () {
			dbDriver.off('record:' + id, listener);
			if (child) {
				set.delete(child.id);
				child.clear();
			}
		}
	};
};

module.exports = memoize(function (dbName, ownerId, keyPath) {
	var set;
	dbName = ensureString(dbName);
	ownerId = ensureString(ownerId);
	keyPath = ensureString(keyPath);
	set = new ObservableSet();
	set.promise = observe(set, dbName, ownerId, keyPath).promise;
	return set;
}, { primitive: true });
