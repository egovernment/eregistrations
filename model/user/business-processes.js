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
				var processes = [];
				this.initialBusinessProcesses.forEach(function (initialProcess) {
					processes.push(initialProcess);
					_observe(initialProcess.derivedBusinessProcesses).forEach(function (derivedProcess) {
						processes.push(derivedProcess);
					});
				});

				return processes;
			}
		}
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
