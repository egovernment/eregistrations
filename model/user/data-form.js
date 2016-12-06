// Guide related properties

'use strict';

var memoize                = require('memoizee/plain')
  , defineUser             = require('./base')
  , defineFormSection      = require('../form-section')
  , defineFormSectionGroup = require('../form-section-group');

module.exports = memoize(function (db/*, options*/) {
	var User                  = defineUser(db, arguments[1])
	  , FormSectionGroup      = defineFormSectionGroup(db)
	  , FormSection           = defineFormSection(db)
	  , getApplicablePropName = db.Object.getApplicablePropName;

	User.prototype.defineProperties({
		// Used during user create and edit
		dataForm: { type: FormSectionGroup, nested: true }
	});

	User.prototype.dataForm.setProperties({
		actionUrl: function () {
			// We're adding new user
			if (this.master === this.database.User.prototype) {
				return 'user-add';
			}
			// We're editing existing user
			return 'user/' + this.master.__id__;
		}
	});

	User.prototype.dataForm.sections.defineProperties({
		profile: { type: FormSection, nested: true },
		additional: { type: FormSection, nested: true }
	});

	User.prototype.dataForm.sections.profile.setProperties({
		excludedFromStatus: ['password'],
		propertyNames: ['firstName', 'lastName', 'email', 'phone', 'password']
	});
	User.prototype.dataForm.sections.additional.setProperties({
		propertyNames: ['isSuperUser', 'roles', 'institution']
	});

	User.prototype.set(getApplicablePropName('roles'), function () {
		return !this.isSuperUser;
	});

	return User;
}, { normalizer: require('memoizee/normalizers/get-1')() });
