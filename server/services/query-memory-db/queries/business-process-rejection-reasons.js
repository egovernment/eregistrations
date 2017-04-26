'use strict';

var ensureObject   = require('es5-ext/object/valid-object')
  , ensureString   = require('es5-ext/object/validate-stringifiable-value')
  , ensureDatabase = require('dbjs/valid-dbjs');

module.exports = exports = function (db) {
	ensureDatabase(db);

	return function (query) {
		var businessProcessId = ensureString(ensureObject(query).businessProcessId), businessProcess
		  , result;
		result = {
			hasOnlySystemicReasons: true,
			rejectionType: null,
			rejectionReasons: [],
			service: {
				type: null,
				id: null,
				businessName: null
			},
			operator: {
				id: null,
				name: null
			},
			processingStep: {
				path: null,
				label: null
			},
			date: null
		};
		businessProcess = db.BusinessProcess.getById(businessProcessId);
		if (!businessProcess) return;
		result.service.businessName = businessProcess.businessName;

		return result;
	};
};
