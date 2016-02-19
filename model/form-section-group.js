/** This class should be used as a super class for those section classes
 * which handle forms with more than one fields group.
 */

'use strict';

var memoize               = require('memoizee/plain')
  , validDb               = require('dbjs/valid-dbjs')
  , defineFormSectionBase = require('./form-section-base')
  , defineProgressRule    = require('./lib/progress-rule');

module.exports = memoize(function (db) {
	var FormSectionGroup, FormSectionBase, ProgressRule;
	validDb(db);
	FormSectionBase = defineFormSectionBase(db);
	ProgressRule    = defineProgressRule(db);
	FormSectionGroup = FormSectionBase.extend('FormSectionGroup', {
		// A map of child sections.
		// Note: to add a child section you should define a type on sections map.
		// Example: BusinessProcess.prototype.formSections.groupSection.sections.define('myChild', {
		// type: db.ChildClass })
		sections: {
			type: db.Object,
			nested: true
		},
		applicableSections: {
			multiple: true,
			type: FormSectionBase,
			value: function (_observe) {
				var result = [];
				this.sections.forEach(function (section) {
					if (_observe(section._isApplicable)) result.push(section);
				});
				return result;
			}
		},
		lastEditStamp: {
			value: function (_observe) {
				var res = 0, resolvedResolvent;

				if (this.resolventProperty) {
					resolvedResolvent = this.ensureResolvent(_observe);

					if (!resolvedResolvent) return;

					res = _observe(resolvedResolvent.object['_' + resolvedResolvent.key]._lastModified);
				}

				this.applicableSections.forEach(function (section) {
					if (_observe(section._lastEditStamp) > res) res = section.lastEditStamp;
				});

				return res;
			}
		},
		hasDisplayableRuleDeep: {
			value: function (_observe) {
				if (_observe(this.progressRules.displayable._size) > 0) return true;

				return this.applicableSections.some(function (child) {
					return _observe(child._hasDisplayableRuleDeep);
				});
			}
		},
		hasMissingRequiredPropertyNamesDeep: {
			value: function (_observe) {
				if (this.isUnresolved) {
					return this.resolventStatus < 1;
				}

				return this.applicableSections.some(function (child) {
					return _observe(child._hasMissingRequiredPropertyNamesDeep);
				});
			}
		}
	});
	FormSectionGroup.prototype.sections._descriptorPrototype_.type = FormSectionBase;

	FormSectionGroup.prototype.progressRules.map.define('subSections', {
		type: ProgressRule,
		nested: true
	});

	FormSectionGroup.prototype.progressRules.map.subSections.setProperties({
		progress: function (_observe) {
			var sum = 0, resolvedResolvent, isResolventExcluded, section;
			section = this.owner.owner.owner;

			if (section.resolventProperty) {
				resolvedResolvent = section.ensureResolvent(_observe);

				if (!resolvedResolvent) return 0;

				isResolventExcluded = section.isPropertyExcludedFromStatus(resolvedResolvent, _observe);
				if (_observe(resolvedResolvent.observable) !== _observe(section._resolventValue)) {
					if (isResolventExcluded) return 1;

					if (resolvedResolvent.descriptor.multiple) {
						if (_observe(resolvedResolvent.observable).size) return 1;
					} else {
						if (_observe(resolvedResolvent.observable) != null) return 1;
					}

					return 0;
				}
				if (!isResolventExcluded) {
					++sum;
				}
			}

			_observe(section.applicableSections).forEach(function (section) {
				sum += (_observe(section._status) * _observe(section._weight));
			});

			if (!this.weight) return 1;

			return sum / this.weight;
		},
		weight: function (_observe) {
			var weightTotal = 0, resolvedResolvent, isResolventExcluded, section;
			section = this.owner.owner.owner;

			if (section.resolventProperty) {
				resolvedResolvent = section.ensureResolvent(_observe);

				if (!resolvedResolvent) return 0;

				isResolventExcluded = section.isPropertyExcludedFromStatus(resolvedResolvent, _observe);
				if (_observe(resolvedResolvent.observable) !== _observe(section._resolventValue)) {
					return isResolventExcluded ? 0 : 1;
				}

				if (!isResolventExcluded) {
					++weightTotal;
				}
			}

			_observe(section.applicableSections).forEach(function (section) {
				weightTotal += _observe(section._weight);
			});

			return weightTotal;
		}
	});

	return FormSectionGroup;
}, { normalizer: require('memoizee/normalizers/get-1')() });
