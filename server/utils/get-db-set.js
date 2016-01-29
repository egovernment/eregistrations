// Returns observable set of all master ids that for given keyPath have saved provided value

'use strict';

var deferred            = require('deferred')
  , memoize             = require('memoizee')
  , ensureStorage       = require('dbjs-persistence/ensure-storage')
  , resolveFilter       = require('dbjs-persistence/lib/resolve-filter')
  , resolveDirectFilter = require('dbjs-persistence/lib/resolve-direct-filter')
  , ObservableSet       = require('observable-set/primitive')

  , isArray = Array.isArray;

module.exports = memoize(function (storage, recordType, keyPath, value) {
	var set = new ObservableSet(), storages;
	if (isArray(storage)) storages = storage.map(ensureStorage);
	else storages = [ensureStorage(storage)];

	return deferred.map(storages, function (storage) {
		storage.on('key:' + keyPath || '&', function (event) {
			var result;
			if (recordType === 'computed') result = resolveFilter(value, event.data.value);
			else result = resolveDirectFilter(value, event.data.value, event.id);
			if (result) set.add(event.ownerId);
			else set.delete(event.ownerId);
		});
		if (recordType === 'computed') {
			return storage.searchComputed(keyPath, function (ownerId, data) {
				if (resolveFilter(value, data.value)) set.add(ownerId);
			})(set);
		}
		return storage.search(keyPath, function (id, data) {
			var index;
			if (!resolveDirectFilter(value, data.value, id)) return;
			index = id.indexOf('/');
			set.add((index === -1) ? id : id.slice(0, index));
		});
	})(set);
}, { primitive: true });
