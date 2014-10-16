'use strict';

var memoize               = require('memoizee')
  , validDb               = require('dbjs/valid-dbjs')
  , validDbType           = require('dbjs/valid-dbjs-type')
  , defineFormSectionBase = require('./form-section-base');

module.exports = memoize(function (MainSectionObject) {
	var FormSectionBase, db;
	db = validDb(MainSectionObject.database);
	validDbType(MainSectionObject);
	FormSectionBase = defineFormSectionBase(db);
	MainSectionObject.prototype.define('formSections', {
		type: FormSectionBase,
		reverse: 'entityPrototype',
		unique: true,
		multiple: true
	});
	return MainSectionObject;
}, { normalizer: require('memoizee/normalizers/get-1')() });
