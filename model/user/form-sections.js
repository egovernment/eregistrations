'use strict';

var memoize               = require('memoizee')
  , validDb               = require('dbjs/valid-dbjs')
  , defineUser            = require('mano-auth/model/user')
  , defineFormSectionBase = require('../form-section-base');

module.exports = memoize(function (db) {
	var User, FormSectionBase;
	validDb(db);
	User = defineUser(db);
	FormSectionBase = defineFormSectionBase(db);
	User.prototype.define('formSections', {
		type: FormSectionBase,
		reverse: 'entityPrototype',
		unique: true,
		multiple: true
	});
	return User;
}, { normalizer: require('memoizee/normalizers/get-1')() });
