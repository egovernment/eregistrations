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
			var sum = 0, resolved;
			if (this.constructor.resolventProperty) {
				resolved = this.master.resolveSKeyPath(this.constructor.resolventProperty);
				if (_observe(resolved.observable) !== _observe(this.resolventValue)) {
					if (!resolved.descriptor.required || (_observe(resolved.observable) != null)) return 1;
					return 0;
				}
			}
			this.sections.forEach(function (section) {
				sum += _observe(section._status);
			});
			return sum / this.sections.size;
		} }
	});
	FormSectionGroup.prototype.sections._descriptorPrototype_.type = FormSection;
	FormSectionGroup.prototype.sections._descriptorPrototype_.nested = true;

	return FormSectionGroup;
}, { normalizer: require('memoizee/normalizers/get-1')() });
