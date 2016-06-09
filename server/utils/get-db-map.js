// Creates  { master: value } map for provided keyPath

'use strict';

var ensureString  = require('es5-ext/object/validate-stringifiable-value')
  , endsWith      = require('es5-ext/string/#/ends-with')
  , deferred      = require('deferred')
  , ObservableMap = require('observable-map/primitive')
  , ensureStorage = require('dbjs-persistence/ensure-storage')

  , isArray = Array.isArray;

module.exports = function (storage, keyPath/*, options*/) {
	var map, storages, options = Object(arguments[2])
	  , recordType = (options.recordType === 'computed') ? 'computed' : 'direct';

	if (isArray(storage)) storages = storage.map(ensureStorage);
	else storages = [ensureStorage(storage)];
	ensureString(keyPath);

	map = new ObservableMap();
	return deferred.map(storages, function (storage) {
		storage.on('key:' + keyPath, function (event) {
			var old, nu;
			if (event.type !== recordType) return;
			if (event.old && event.old.value && (event.old.value !== '0')) {
				if (event.path === event.keyPath) old = event.old.value;
			}
			if (event.data.value && (event.data.value !== '0')) {
				if (event.path === event.keyPath) nu = event.data.value;
			}
			if (old === nu) return;
			if (nu) map.set(event.ownerId, nu);
			else if (old) map.delete(event.ownerId);
		}.bind(this));
		if (recordType === 'direct') {
			return storage.search({ keyPath: keyPath }, function (id, data) {
				if (endsWith.call(id, '/' + keyPath)) {
					if (data.value && (data.value !== '0')) map.set(id.split('/', 1)[0], data.value);
				}
			});
		}
		return storage.searchComputed({ keyPath: keyPath }, function (id, data) {
			var ownerId = id.split('/', 1)[0];
			if (isArray(data.value)) return;
			if (data.value && (data.value !== '0')) map.set(ownerId, data.value);
		});
	})(map);
};
