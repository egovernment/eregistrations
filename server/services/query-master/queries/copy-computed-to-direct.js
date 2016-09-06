'use strict';

var ensureObject = require('es5-ext/object/valid-object')
  , ensureString = require('es5-ext/object/validate-stringifiable-value')
  , idToStorage  = require('../../../utils/any-id-to-storage');

module.exports = function () {
	return function (query) {
		var businessProcessId, keyPath;
		ensureObject(query);
		businessProcessId = ensureString(query.businessProcessId);
		keyPath           = ensureString(query.keyPath);

		return idToStorage(businessProcessId)(function (storage) {
			var computedData = storage.getComputed(businessProcessId + '/' + keyPath);
			if (!computedData) return;
			storage.store(businessProcessId + '/' + keyPath, computedData.value, computedData.stamp);
		});
	};
};
