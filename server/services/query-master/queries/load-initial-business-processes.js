'use strict';

var ensureObject   = require('es5-ext/object/valid-object')
  , ensureString   = require('es5-ext/object/validate-stringifiable-value')
  , loadToMemoryDb = require('mano/lib/server/resolve-user-access')
  , driver         = require('mano').dbDriver;

module.exports = function () {
	return function (query) {
		var userId, businessProcesses = [];
		ensureObject(query);
		userId = ensureString(query.userId);

		return driver.getStorage('user')
			.getObjectKeyPath(userId + '/initialBusinessProcesses')(function (result) {
				if (!result) return;
				result.forEach(function (entry) {
					if (entry.id === userId) return;
					businessProcesses.push(entry.id.split('*')[1].slice(1));
				});
				if (!businessProcesses.length) return false;
				return loadToMemoryDb(businessProcesses)(true);
			});
	};
};
