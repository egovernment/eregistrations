// Guide related properties

'use strict';

var memoize                = require('memoizee/plain')
  , _                      = require('mano').i18n.bind("Model: User")
  , defineUser             = require('./base')
  , defineFormSection      = require('../form-section')
  , defineFormSectionGroup = require('../form-section-group');

module.exports = memoize(function (db/*, options*/) {
	var User = defineUser(db, arguments[1])
	  , FormSectionGroup = defineFormSectionGroup(db)
	  , FormSection      = defineFormSection(db);

	User.prototype.defineProperties({
		// Used during user create and edit
		dataForm: { type: FormSectionGroup, nested: true }
	});

	User.prototype.dataForm.setProperties({
		label: _("New User"),
		actionUrl: 'user-add'
	});

	User.prototype.dataForm.sections.defineProperties({
		profile: { type: FormSection, nested: true },
		additional: { type: FormSection, nested: true }
	});

	User.prototype.dataForm.sections.profile.setProperties({
		propertyNames: ['firstName', 'lastName', 'email', 'password']
	});
	User.prototype.dataForm.sections.additional.setProperties({
		propertyNames: ['roles', 'institution']
	});

	return User;
}, { normalizer: require('memoizee/normalizers/get-1')() });
