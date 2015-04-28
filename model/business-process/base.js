"use strict";

var memoize                     = require('memoizee/plain')
  , validDb                     = require('dbjs/valid-dbjs')
  , defineStatusLog  = require('../status-log')
  , defineStringLine = require('dbjs-ext/string/string-line')
  , defineBusinessProcessStatus = require('../lib/business-process-status');

module.exports = memoize(function (db/*, options*/) {
	var StringLine, BusinessProcessStatus;
	validDb(db);
	BusinessProcessStatus = defineBusinessProcessStatus(db);
	StringLine            = defineStringLine(db);

	db.Object.extend('BusinessProcess', {
		status: { type: BusinessProcessStatus, value: 'draft' },
		submitted: { type: db.Boolean, value: false },
		businessName: { type: StringLine }
	});

	db.BusinessProcess.prototype.defineProperties({
		derivedBusinessProcesses: {
			type: db.BusinessProcess,
			multiple: true
		}
	});

	defineStatusLog(db.BusinessProcess);

	return db.BusinessProcess;
}, { normalizer: require('memoizee/normalizers/get-1')() });
