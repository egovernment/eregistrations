'use strict';

var memoize               = require('memoizee/plain')
  , validDb               = require('dbjs/valid-dbjs')
  , defineStringLine      = require('dbjs-ext/string/string-line')
  , defineFormSectionBase = require('./form-section-base');

module.exports = memoize(function (db) {
	var StringLine, FormSectionBase;
	validDb(db);
	StringLine = defineStringLine(db);
	FormSectionBase = defineFormSectionBase(db);
	return FormSectionBase.extend('FormEntitiesTable', {
		propertyName: { type: StringLine, required: true }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
