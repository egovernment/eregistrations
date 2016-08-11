'use strict';

var ensureObject   = require('es5-ext/object/valid-object')
  , ensureString   = require('es5-ext/object/validate-stringifiable-value')
  , copy           = require('es5-ext/object/copy')
  , ensureDatabase = require('dbjs/valid-dbjs');

module.exports = exports = function (db) {
	ensureDatabase(db);

	return function (query) {
		var businessProcessId = ensureString(ensureObject(query).businessProcessId), businessProcess
		  , result = { businessName: null, statusLog: [] };
		businessProcess = db.BusinessProcess.getById(businessProcessId);
		if (!businessProcess) return;
		result.businessName = businessProcess.businessName;
		businessProcess.statusLog.ordered.forEach(function (log) {
			var rowResult = copy(log);
			rowResult.time = log.time.toString();
			if (log.official) {
				rowResult.official = log.official.fullName;
			}
			result.statusLog.push(rowResult);
		});

		return result;
	};
};
