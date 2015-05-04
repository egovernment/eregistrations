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
		initialBusinessProcesses: {
			type: BusinessProcess,
			unique: true,
			multiple: true,
			reverse: 'user'
		},
		completedInitialBusinessProcesses: {
			type: BusinessProcess,
			multiple: true,
			value: function (_observe) {
				var result = [];
				this.initialBusinessProcesses.forEach(function (businessProcess) {
					if (_observe(businessProcess._isApplicationResolved)) {
						result.push(businessProcess);
					}
				});

				return result;
			}
		},
		businessProcesses: {
			type: BusinessProcess,
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

	return Target;
}, { normalizer: require('memoizee/normalizers/get-1')() });
