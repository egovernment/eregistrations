// Guide related properties

'use strict';

var memoize                = require('memoizee/plain')
  , defineUser             = require('./base')
  , defineFormSectionGroup = require('../form-section-group');

module.exports = memoize(function (db/*, options*/) {
	var User = defineUser(db, arguments[1])
	  , FormSectionGroup = defineFormSectionGroup(db);

	User.prototype.defineProperties({
		// Used during user create and edit
		dataForm: { type: FormSectionGroup, nested: true }
	});

	return User;
}, { normalizer: require('memoizee/normalizers/get-1')() });
