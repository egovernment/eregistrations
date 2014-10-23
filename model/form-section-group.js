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
		status: { value: function () {
			var sum = 0;
			this.sections.forEach(function (section) {
				sum += section.status;
			});
			return sum / this.sections.size;
		} }
	});
	FormSectionGroup.prototype.sections._descriptorPrototype_.type = FormSection;
	FormSectionGroup.prototype.sections._descriptorPrototype_.nested = true;

	return FormSectionGroup;
}, { normalizer: require('memoizee/normalizers/get-1')() });
