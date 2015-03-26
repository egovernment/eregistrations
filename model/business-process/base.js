"use strict";

var memoize                     = require('memoizee/plain')
  , validDb                     = require('dbjs/valid-dbjs')
  , defineBusinessProcessStatus = require('../lib/business-process-status');

module.exports = memoize(function (db/*, options*/) {
	var BusinessProcessStatus;
	validDb(db);
	BusinessProcessStatus = defineBusinessProcessStatus(db);

	db.Object.extend('BusinessProcess', {
		status: { type: BusinessProcessStatus, value: 'draft' }
	});

	db.BusinessProcess.prototype.defineProperties({
		derivedBusinessProcesses: {
			type: db.BusinessProcess,
			multiple: true
		}
	});

	return db.BusinessProcess;
}, { normalizer: require('memoizee/normalizers/get-1')() });
