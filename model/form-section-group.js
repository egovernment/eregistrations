'use strict';

var memoize         = require('memoizee/plain')
  , validDb         = require('dbjs/valid-dbjs')
  , FormSectionBase = require('./form-section-base')
  , FormSection     = require('./form-section');

module.exports = memoize(function (db) {
	validDb(db);
	FormSectionBase = FormSectionBase(db); //jslint: ignore
	FormSection     = FormSection(db);     //jslint: ignore
	return FormSectionBase.extend('FormSectionGroup', {
		sections: { type: FormSection, multiple: true }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
