'use strict';

var Database = require('dbjs')
  , defineFormSection = require('../../../model/form-section')
  , defineFormSectionGroup = require('../../../model/form-section-group');

module.exports = function (t, a) {
	var db = new Database()
	  , User = t(db)
	  , FormSection = defineFormSection(db)
	  , FormSectionGroup = defineFormSectionGroup(db)

	  , user = new User();

	a(user.getDescriptor('dataForm').type, FormSectionGroup);
	a(user.dataForm.sections.getDescriptor('profile').type, FormSection);
	a(user.dataForm.sections.profile.propertyNames.has('email'), true);
	a(user.dataForm.sections.profile.propertyNames.has('password'), true);
};
