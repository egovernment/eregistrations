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
				var sections = [], sectionNames = {}, derivatives = [], sectionFilter;

				sectionFilter = function (section, sectionName) {
					if (!sectionNames[sectionName] && _observe(section._status) > 0) {
						sectionNames[sectionName] = true;
						sections.push(section);
					}
				};

				// we want to avoid potential race condition, hence no toArray
				if (this.master.derivedBusinessProcesses) {
					_observe(this.master.derivedBusinessProcesses).forEach(function (derived) {
						derivatives.push(derived);
					});
					derivatives.reverse().forEach(function (derived) {
						if (derived.dataForms) {
							derived.dataForms.applicable.forEach(sectionFilter);
						}
					});
				}
				if (this.applicable) {
					this.applicable.forEach(sectionFilter);
				}

				return sections;
			}
		}
	});

	return BusinessProcess;
}, { normalizer: require('memoizee/normalizers/get-1')() });
