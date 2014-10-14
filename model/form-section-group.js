'use strict';

var memoize               = require('memoizee/plain')
  , validDb               = require('dbjs/valid-dbjs')
  , defineFormSectionBase = require('./form-section-base')
  , defineFormSection     = require('./form-section');

module.exports = memoize(function (db) {
	var FormSectionBase, FormSection;
	validDb(db);
	FormSectionBase = defineFormSectionBase(db);
	FormSection     = defineFormSection(db);
	return FormSectionBase.extend('FormSectionGroup', {
		sections: { type: FormSection, multiple: true }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
