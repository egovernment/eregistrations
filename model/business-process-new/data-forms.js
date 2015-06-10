// BusinessProcess data forms (step 1 of Part A) resolution

'use strict';

var memoize                     = require('memoizee/plain')
  , definePropertyGroupsProcess = require('../lib/property-groups-process')
  , defineInitial               = require('./abse');

module.exports = memoize(function (db/* options */) {
	var BusinessProcess       = defineInitial(db, arguments[1])
	  , PropertyGroupsProcess = definePropertyGroupsProcess(db);

	BusinessProcess.prototype.defineProperties({
		dataForms: { type: PropertyGroupsProcess, nested: true }
	});
	return BusinessProcess;
}, { normalizer: require('memoizee/normalizers/get-1')() });
