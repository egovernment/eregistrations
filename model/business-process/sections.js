'use strict';

var memoize       = require('memoizee/plain')
  , defineSection = require('../form-section-base')
  , validDbType   = require('dbjs/valid-dbjs-type');

module.exports = memoize(function (Target/* options */) {
	var db, FormSectionBase;
	validDbType(Target);
	db = Target.database;
	FormSectionBase = defineSection(db);
	Target.prototype.defineProperties({
		cumulatedSections: {
			type: FormSectionBase,
			multiple: true,
			value: function (_observe) {
				var sections = [], sectionNames = {}, derivatives = [], sectionFilter;

				sectionFilter = function (section, sectionName) {
					if (!sectionNames[sectionName] && _observe(section._isApplicable)
							&& _observe(section._status) > 0) {
						sectionNames[sectionName] = true;
						sections.push(section);
					}
				};
				// we want to avoid potential race condition, hence no toArray
				this.derivedBusinessProcesses.forEach(function (derived) {
					derivatives.push(derived);
				});
				derivatives.reverse().forEach(function (derived) {
					if (derived.formSections) {
						derived.formSections.forEach(sectionFilter);
					}
				});
				if (this.formSections) {
					this.formSections.forEach(sectionFilter);
				}

				return sections;
			}
		}
	});

	return Target;
}, { normalizer: require('memoizee/normalizers/get-1')() });
