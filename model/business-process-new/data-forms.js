// BusinessProcess data forms (step 1 of Part A) resolution

'use strict';

var memoize                     = require('memoizee/plain')
  , definePropertyGroupsProcess = require('../lib/property-groups-process')
  , defineInitial               = require('./base')
  , defineFormSectionBase       = require('../form-section-base');

module.exports = memoize(function (db/* options */) {
	var BusinessProcess       = defineInitial(db, arguments[1])
	  , PropertyGroupsProcess = definePropertyGroupsProcess(db)
	  , FormSectionBase       = defineFormSectionBase(db);

	BusinessProcess.prototype.defineProperties({
		dataForms: { type: PropertyGroupsProcess, nested: true }
	});

	BusinessProcess.prototype.dataForms.defineProperties({
		// Applicable form sections across all derivedProcesses
		processChainApplicable: {
			type: FormSectionBase,
			multiple: true,
			value: function (_observe) {
				var processes = [this.master], sections = [], taken = Object.create(null);

				// Gather all business processes in chain
				_observe(this.master.derivedBusinessProcesses).forEach(function (process) {
					processes.push(process);
				});
				// Iterate processes in reverse order (latest one should be considered first);
				processes.reverse().forEach(function (process) {
					_observe(process.dataForms.applicable).forEach(function (section, name) {
						if (_observe(section._status) === 0) return;
						if (taken[name]) return;
						taken[name] = true;
						sections.push(section);
					});
				});

				return sections;
			}
		},
		onlinePaymentDependents: {
			type: FormSectionBase,
			multiple: true,
			value: function (_observe) {
				var result = [];
				this.applicable.forEach(function (section) {
					if (_observe(section._isOnlinePaymentDependent)) {
						result.push(section);
					}
				});

				return result;
			}
		}
	});

	return BusinessProcess;
}, { normalizer: require('memoizee/normalizers/get-1')() });
