'use strict';

var ensureString   = require('es5-ext/object/validate-stringifiable-value')
  , getIdToStorage = require('./get-id-to-storage')
  , driver         = require('mano').dbDriver

  , getId;

driver.getStorages().done(function (storages) { getId = getIdToStorage(storages); });

module.exports = function self(id) {
	ensureString(id);
	if (!getId) {
		return driver.getStorages()(function () { return self(id); });
	}
	return getId(id);
};
