'use strict';

var memoize               = require('memoizee/plain')
  , defineBusinessProcess = require('../business-process/base')
  , validDbType           = require('dbjs/valid-dbjs-type');

module.exports = memoize(function (Target/* options */) {
	var db, options, BusinessProcess;
	validDbType(Target);
	options = Object(arguments[1]);
	db      = Target.database;
	BusinessProcess = defineBusinessProcess(db, options);
	Target.prototype.defineProperties({
		businessProcesses: {
			type: BusinessProcess,
			unique: true,
			multiple: true,
			reverse: 'user'
		}
	});

	return Target;
}, { normalizer: require('memoizee/normalizers/get-1')() });
