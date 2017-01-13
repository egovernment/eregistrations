'use strict';

var memoize               = require('memoizee/plain')
  , ensureType            = require('dbjs/valid-dbjs-type')
  , defineBusinessProcess = require('../lib/business-process-base');

module.exports = memoize(function (User/* options */) {
	var db = ensureType(User).database, BusinessProcessBase, ServiceMeta;

	BusinessProcessBase = defineBusinessProcess(db);

	ServiceMeta = db.Object.extend('ServiceMeta', {
		isOpenForNewDraft: {
			type: db.Boolean,
			value: function (_observe) {
				var serviceName = this.key, db = this.database, BusinessProcess, bpSet, count = 0;
				BusinessProcess = db['BusinessProcess' + serviceName[0].toUpperCase() +
					serviceName.slice(1)];
				if (!BusinessProcess || (BusinessProcess.draftLimit == null)) return;
				bpSet = _observe(this.master.initialBusinessProcesses);
				bpSet.forEach(function (businessProcess) {
					if (_observe(businessProcess._isSubmitted) ||
							!_observe(businessProcess._isFromEregistrations)) {
						return;
					}
					if (businessProcess.constructor === BusinessProcess) count++;
				});

				return count < BusinessProcess.draftLimit;
			}
		}
	});

	User.prototype.defineProperties({
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
		},
		revertedBusinessProcesses: {
			type: BusinessProcessBase,
			multiple: true,
			value: function (_observe) {
				var result = [];
				this.initialBusinessProcesses.forEach(function (businessProcess) {
					if (_observe(businessProcess._isSentBack) ||
							_observe(businessProcess._isUserProcessing)) {
						result.push(businessProcess);
					}
				});

				return result;
			}
		},
		services: {
			type: db.Object,
			nested: true
		}
	});

	User.prototype.services._descriptorPrototype_.type = ServiceMeta;
	User.prototype.services._descriptorPrototype_.nested = true;

	return User;
}, { normalizer: require('memoizee/normalizers/get-1')() });
