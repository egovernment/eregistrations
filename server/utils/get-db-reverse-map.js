// Creates reverse { value: master } map for provided keyPath

'use strict';

var ensureString = require('es5-ext/object/validate-stringifiable-value')
  , endsWith     = require('es5-ext/string/#/ends-with')
  , deferred     = require('deferred')
  , Map          = require('es6-map')
  , dbDriver     = require('mano').dbDriver

  , isArray = Array.isArray;

module.exports = function (storageName, keyPath) {
	var map, storages = [];
	if (isArray(storageName)) {
		storageName.forEach(function (storageName) {
			storages.push(dbDriver.getStorage(ensureString(storageName)));
		});
	} else {
		storages.push(dbDriver.getStorage(ensureString(storageName)));
	}
	ensureString(keyPath);

	map = new Map();
	return deferred.map(storages, function (storage) {
		storage.on('key:' + keyPath, function (event) {
			var old, nu;
			if (event.type !== 'direct') return;
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
			if (old === nu) return;
			if (old) map.delete(old);
			if (nu) map.set(nu, event.ownerId);
		}.bind(this));
		return storage.search(keyPath, function (id, data) {
			var ownerId;
			if (endsWith.call(id, '/' + keyPath)) {
				if (data.value && (data.value !== '0')) map.set(data.value, id.split('/', 1)[0]);
			} else {
				ownerId = id.split('/', 1)[0];
				if (data.value === '11') map.set(id.slice(ownerId.length + keyPath.length + 2), ownerId);
			}
		});
	})(map);
};
