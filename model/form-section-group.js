'use strict';

var memoize               = require('memoizee/plain')
  , validDb               = require('dbjs/valid-dbjs')
  , defineStringLine      = require('dbjs-ext/string/string-line')
  , defineFormSectionBase = require('./form-section-base')
  , defineFormSection     = require('./form-section');

module.exports = memoize(function (db) {
	var StringLine, FormSectionBase, FormSection;
	validDb(db);
	FormSectionBase = defineFormSectionBase(db);
	FormSection     = defineFormSection(db);
	StringLine      = defineStringLine(db);
	return FormSectionBase.extend('FormSectionGroup', {
		sections: { type: FormSection, multiple: true },
		statusResolventProperty: { type: StringLine, required: true }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
