// Creates reverse { value: master } map for provided keyPath

'use strict';

var ensureArray      = require('es5-ext/array/valid-array')
  , diff             = require('es5-ext/array/#/diff')
  , ensureString     = require('es5-ext/object/validate-stringifiable-value')
  , endsWith         = require('es5-ext/string/#/ends-with')
  , deferred         = require('deferred')
  , Map              = require('es6-map')
  , ensureStorage    = require('dbjs-persistence/ensure-storage')
  , resolveEventKeys = require('dbjs-persistence/lib/resolve-event-keys')

  , isArray = Array.isArray;

module.exports = function (storage, keyPath/*, options*/) {
	var map, storages, options = Object(arguments[2])
	  , recordType = (options.recordType === 'computed') ? 'computed' : 'direct';

	if (isArray(storage)) storages = storage.map(ensureStorage);
	else storages = [ensureStorage(storage)];
	ensureString(keyPath);

	map = new Map();
	return deferred.map(storages, function (storage) {
		storage.on('key:' + keyPath, function (event) {
			var old, nu;
			if (event.type !== recordType) return;
			if (event.old && event.old.value && (event.old.value !== '0')) {
				if (event.path !== event.keyPath) {
					if (event.old.value === '11') old = event.path.slice(keyPath.length + 1);
				} else {
					old = event.old.value;
				}
			}
			if (event.data.value && (event.data.value !== '0')) {
				if (event.path !== event.keyPath) {
					if (event.data.value === '11') nu = event.path.slice(keyPath.length + 1);
				} else {
					nu = event.data.value;
				}
			}
			if (isArray(old)) {
				nu = resolveEventKeys(ensureArray(nu));
				old = resolveEventKeys(old);
				diff.call(old, nu).forEach(map.delete, map);
				diff.call(nu, old).forEach(function (nu) { map.set(nu, event.ownerId); });
				return;
			}
			if (old === nu) return;
			if (old) map.delete(old);
			if (nu) map.set(nu, event.ownerId);
		}.bind(this));
		if (recordType === 'direct') {
			return storage.search(keyPath, function (id, data) {
				var ownerId;
				if (endsWith.call(id, '/' + keyPath)) {
					if (data.value && (data.value !== '0')) map.set(data.value, id.split('/', 1)[0]);
				} else {
					ownerId = id.split('/', 1)[0];
					if (data.value === '11') map.set(id.slice(ownerId.length + keyPath.length + 2), ownerId);
				}
			});
		}
		return storage.searchComputed(keyPath, function (ownerId, data) {
			if (isArray(data.value)) {
				resolveEventKeys(data.value).forEach(function (nu) { map.set(nu, ownerId); });
			} else {
				if (data.value && (data.value !== '0')) map.set(data.value, ownerId);
			}
		});
	})(map);
};
