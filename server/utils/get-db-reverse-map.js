'use strict';

var ensureString   = require('es5-ext/object/validate-stringifiable-value')
  , endsWith       = require('es5-ext/string/#/ends-with')
  , Map            = require('es6-map')
  , dbDriver       = require('mano').dbDriver;

module.exports = function (dbName, keyPath/*, options*/) {
	var map, promise;
	ensureString(dbName);
	ensureString(keyPath);

	map = new Map();
	promise = dbDriver.searchDirect(keyPath, function (id, data) {
		var ownerId;
		if (endsWith.call(id, '/' + keyPath)) {
			if (data.value && (data.value !== '0')) map.set(data.value, id.split('/', 1)[0]);
		} else {
			ownerId = id.split('/', 1)[0];
			if (data.value === '11') map.set(id.slice(ownerId + keyPath.length + 2), ownerId);
		}
	});
	dbDriver.on('direct:' + keyPath, function (event) {
		var old, nu;
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
	return promise(map);
};
