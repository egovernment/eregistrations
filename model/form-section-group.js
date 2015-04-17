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
		sections: {
			type: db.Object,
			nested: true
		},
		status: { value: function (_observe) {
			var sum = 0, resolved, isResolventExcluded, weightModifier;
			weightModifier = 0;
			if (this.constructor.resolventProperty) {
				resolved = this.master.resolveSKeyPath(this.constructor.resolventProperty, _observe);
				if (!resolved) {
					return 0;
				}
				isResolventExcluded = this.isPropertyExcludedFromStatus(resolved, _observe);
				if (_observe(resolved.observable) !== _observe(this.resolventValue)) {
					if (isResolventExcluded) return 1;
					if (resolved.descriptor.multiple) {
						if (_observe(resolved.observable).size) return 1;
					} else {
						if (_observe(resolved.observable) != null) return 1;
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
			var weightTotal = 0, resolved, isResolventExcluded;
			if (this.constructor.resolventProperty) {
				resolved = this.master.resolveSKeyPath(this.constructor.resolventProperty, _observe);
				if (!resolved) {
					return 0;
				}
				isResolventExcluded = this.isPropertyExcludedFromStatus(resolved, _observe);
				if (_observe(resolved.observable) !== _observe(this.resolventValue)) {
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
		lastEditDate: {
			value: function (_observe) {
				var res = 0;
				this.sections.forEach(function (section) {
					if (_observe(section._editDate) > res) res = section.editDate;
				});

				return res;
			}
		}
	});
	FormSectionGroup.prototype.sections._descriptorPrototype_.type = FormSection;
	FormSectionGroup.prototype.sections._descriptorPrototype_.nested = true;

	return FormSectionGroup;
}, { normalizer: require('memoizee/normalizers/get-1')() });
