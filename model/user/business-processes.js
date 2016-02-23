'use strict';

var memoize               = require('memoizee/plain')
  , ensureType            = require('dbjs/valid-dbjs-type')
  , defineBusinessProcess = require('../lib/business-process-base');

module.exports = memoize(function (User/* options */) {
	var db = ensureType(User).database, BusinessProcessBase;

	BusinessProcessBase = defineBusinessProcess(db);

	return User.prototype.defineProperties({
		initialBusinessProcesses: {
			type: BusinessProcessBase,
			unique: true,
			multiple: true,
			reverse: 'user'
		},
		businessProcesses: {
			type: BusinessProcessBase,
			multiple: true,
			value: function (_observe) {
				return this.initialBusinessProcesses;
			}
		},
		currentBusinessProcess: {
			type: BusinessProcessBase
		}
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
