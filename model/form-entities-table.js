'use strict';

var memoize         = require('memoizee/plain')
  , validDb         = require('dbjs/valid-dbjs')
  , StringLine      = require('dbjs-ext/string/string-line')
  , FormSectionBase = require('./form-section-base');

module.exports = memoize(function (db) {
	validDb(db);
	StringLine = StringLine(db); //jslint: ignore
	FormSectionBase = FormSectionBase(db); //jslint: ignore
	return FormSectionBase.extend('FormEntitiesTable', {
		propertyName: { type: StringLine }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
