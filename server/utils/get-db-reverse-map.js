'use strict';

var ensureString   = require('es5-ext/object/validate-stringifiable-value')
  , Map            = require('es6-map')
  , dbDriver       = require('mano').dbDriver;

module.exports = function (dbName, keyPath/*, options*/) {
	var map, promise;
	ensureString(dbName);
	ensureString(keyPath);

	map = new Map();
	promise = dbDriver.searchDirect(keyPath, function (id, data) {
		if (data.value && (data.value !== '0')) map.set(data.value, id.split('/', 1)[0]);
	});
	dbDriver.on('direct:' + keyPath, function (event) {
		var old, nu;
		if (event.old && event.old.value && (event.old.value !== '0')) old = event.old.value;
		if (event.data.value && (event.data.value !== '0')) nu = event.data.value;
		if (old === nu) return;
		if (old) map.delete(old);
		if (nu) map.set(nu, event.ownerId);
	}.bind(this));
	return promise(map);
};
