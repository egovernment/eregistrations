// BusinessProcess data forms (step 1 of Part A) resolution

'use strict';

var memoize                     = require('memoizee/plain')
  , definePropertyGroupsProcess = require('../lib/property-groups-process')
  , defineDataSnapshot          = require('../lib/data-snapshot')
  , defineBusinessProcess       = require('./base')
  , defineFormSectionBase       = require('../form-section-base');

module.exports = memoize(function (db/* options */) {
	var BusinessProcess       = defineBusinessProcess(db, arguments[1])
	  , PropertyGroupsProcess = definePropertyGroupsProcess(db)
	  , FormSectionBase       = defineFormSectionBase(db)
	  , DataSnapshot          = defineDataSnapshot(db);

	BusinessProcess.prototype.defineProperties({
		dataForms: { type: PropertyGroupsProcess, nested: true }
	});

	BusinessProcess.prototype.dataForms.defineProperties({
		// Submission data forms snapshot will be stored here
		dataSnapshot: { type: DataSnapshot, nested: true },

		// Applicable, touched (at least partially filled) form sections
		processChainApplicable: {
			type: FormSectionBase,
			multiple: true,
			value: function (_observe) {
				var sections = [];

				this.applicable.forEach(function (section) {
					if (_observe(section._status) === 0) return;
					sections.push(section);
				});

				return sections;
			}
		},
		incompleteOnlinePaymentsDependents: {
			type: FormSectionBase,
			multiple: true,
			value: function (_observe) {
				var result = [];
				this.applicable.forEach(function (section) {
					if (_observe(section._isOnlinePaymentDependent) &&
							_observe(section._status) < 1) {
						result.push(section);
					}
				});

				return result;
			}
		}
	});

	return BusinessProcess;
}, { normalizer: require('memoizee/normalizers/get-1')() });
