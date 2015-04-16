'use strict';

var memoize       = require('memoizee/plain')
  , defineSection = require('../form-section')
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
				var sections = [], sectionNames = {}, derivatives, sectionFilter;

				sectionFilter = function (section, sectionName) {
					if (!sectionNames[sectionName]) {
						sectionNames[sectionName] = true;
						sections.push(section);
					}
				};

				if (_observe(this.derivedBusinessProcesses._size)) {
					derivatives = this.derivedBusinessProcesses.toArray().sort(function (a, b) {
						return b.lastModified - a.lastModified;
					});
					derivatives.forEach(function (derived) {
						if (derived.formSections) {
							derived.formSections.forEach(sectionFilter);
						}
					});
				}
				if (this.formSections) {
					this.formSections.forEach(sectionFilter);
				}
				return sections;
			}
		}
	});

	return Target;
}, { normalizer: require('memoizee/normalizers/get-1')() });
