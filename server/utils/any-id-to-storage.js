'use strict';

var identity       = require('es5-ext/function/identity')
  , toArray        = require('es5-ext/object/to-array')
  , ensureString   = require('es5-ext/object/validate-stringifiable-value')
  , deferred       = require('deferred')
  , getIdToStorage = require('./get-id-to-storage')
  , driver         = require('mano').dbDriver
  , driverGlobal   = require('mano').dbDriverGlobal

  , getId, promise;

module.exports = exports = function self(id) {
	ensureString(id);
	if (!getId) {
		return promise(function () { return self(id); });
	}
	return getId(id);
};

if (driverGlobal) {
	promise = deferred(driver.getStorages(), driverGlobal.getStorages());
	promise.done(function (result) {
		getId = getIdToStorage(toArray(result[0], identity).concat(toArray(result[1], identity)));
		exports.setStorage = getId.setStorage;
	});
} else {
	promise = driver.getStorages();
	promise.done(function (storages) {
		getId = getIdToStorage(toArray(storages, identity));
		exports.setStorage = getId.setStorage;
	});
}
