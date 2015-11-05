/** This class should be used as a super class for those section classes
 * which handle forms with more than one fields group.
 */

'use strict';

var memoize               = require('memoizee/plain')
  , validDb               = require('dbjs/valid-dbjs')
  , defineFormSectionBase = require('./form-section-base')
  , defineFormSection     = require('./form-section');

module.exports = memoize(function (db) {
	var FormSectionGroup, FormSectionBase, FormSection;
	validDb(db);
	FormSectionBase = defineFormSectionBase(db);
	FormSection     = defineFormSection(db);
	FormSectionGroup = FormSectionBase.extend('FormSectionGroup', {
		// A map of child sections.
		// Note: to add a child section you should define a type on sections map.
		// Example: BusinessProcess.prototype.formSections.groupSection.sections.define('myChild', {
		// type: db.ChildClass })
		sections: {
			type: db.Object,
			nested: true
		},
		status: { value: function (_observe) {
			var sum = 0, resolvedResolvent, isResolventExcluded, weightModifier = 0;

			if (this.resolventProperty) {
				resolvedResolvent = this.ensureResolvent(_observe);

				if (!resolvedResolvent) return 0;

				isResolventExcluded = this.isPropertyExcludedFromStatus(resolvedResolvent, _observe);
				if (_observe(resolvedResolvent.observable) !== _observe(this.resolventValue)) {
					if (isResolventExcluded) return 1;

					if (resolvedResolvent.descriptor.multiple) {
						if (_observe(resolvedResolvent.observable).size) return 1;
					} else {
						if (_observe(resolvedResolvent.observable) != null) return 1;
					}

					return 0;
				}
				if (!isResolventExcluded) {
					++weightModifier;
					++sum;
				}
			}

			this.sections.forEach(function (section) {
				sum += (_observe(section._status) * _observe(section._weight));
			});

			if (!(this.weight + weightModifier)) return 1;

			return sum / (this.weight + weightModifier);
		} },
		weight: { value: function (_observe) {
			var weightTotal = 0, resolvedResolvent, isResolventExcluded;

			if (this.resolventProperty) {
				resolvedResolvent = this.ensureResolvent(_observe);

				if (!resolvedResolvent) return 0;

				isResolventExcluded = this.isPropertyExcludedFromStatus(resolvedResolvent, _observe);
				if (_observe(resolvedResolvent.observable) !== _observe(this.resolventValue)) {
					return isResolventExcluded ? 0 : 1;
				}

				if (!isResolventExcluded) {
					++weightTotal;
				}
			}

			this.sections.forEach(function (section) {
				weightTotal += _observe(section._weight);
			});

			return weightTotal;
		} },
		lastEditStamp: {
			value: function (_observe) {
				var res = 0, resolvedResolvent;

				if (this.resolventProperty) {
					resolvedResolvent = this.ensureResolvent(_observe);

					if (!resolvedResolvent) return;

					res = _observe(resolvedResolvent.object['_' + resolvedResolvent.key]._lastModified);
				}

				this.sections.forEach(function (section) {
					if (_observe(section._lastEditStamp) > res) res = section.lastEditStamp;
				});

				return res;
			}
		}
	});
	FormSectionGroup.prototype.sections._descriptorPrototype_.type = FormSection;
	FormSectionGroup.prototype.sections._descriptorPrototype_.nested = true;

	return FormSectionGroup;
}, { normalizer: require('memoizee/normalizers/get-1')() });
