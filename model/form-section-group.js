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
			var sum = 0, weightTotal = 0, resolved;
			if (this.constructor.resolventProperty) {
				resolved = this.master.resolveSKeyPath(this.constructor.resolventProperty, _observe);
				if (!resolved) {
					return 0;
				}
				if (_observe(resolved.observable) !== _observe(this.resolventValue)) {
					if (!resolved.descriptor.required || (_observe(resolved.observable) != null)) return 1;
					return 0;
				}
			}
			this.sections.forEach(function (section) {
				sum += (_observe(section._status) * _observe(section._weight));
				weightTotal += section.weight;
			});
			return sum / weightTotal;
		} },
		weight: { value: function (_observe) {
			var weightTotal = 0;
			this.sections.forEach(function (section) {
				weightTotal += _observe(section._weight);
			});

			return weightTotal;
		} }
	});
	FormSectionGroup.prototype.sections._descriptorPrototype_.type = FormSection;
	FormSectionGroup.prototype.sections._descriptorPrototype_.nested = true;

	return FormSectionGroup;
}, { normalizer: require('memoizee/normalizers/get-1')() });
