'use strict';

var ensureObject   = require('es5-ext/object/valid-object')
  , ensureString   = require('es5-ext/object/validate-stringifiable-value')
  , ensureDatabase = require('dbjs/valid-dbjs');

module.exports = exports = function (db) {
	ensureDatabase(db);

	return function (query) {
		var businessProcessId = ensureString(ensureObject(query).businessProcessId), businessProcess;
		businessProcess = db.BusinessProcess.getById(businessProcessId);
		if (!businessProcess) return;
		return businessProcess.toWebServiceJSON();
	};
};
