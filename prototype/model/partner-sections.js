'use strict';

var db          = require('mano').db
  , Event       = require('dbjs/_setup/event')
  , Partner     = db.Partner
  , FormSection = require('../../model/form-section')(db)
  , FormSectionGroup = require('../../model/form-section-group')(db)
  , partner;

partner = Partner.prototype;

partner.formSections.forEach(function (section) {
	new Event(partner._getOwnMultipleItem_('formSections', section, '7' + section.__id__), false);//jslint: ignore
});

FormSectionGroup.newNamed('partnerFormSections', {
	label: "Add new Partner",
	actionUrl: '/',
	statusResolventProperty: 'completionStatus'
});

db.partnerFormSections.sections.add(
	FormSection.newNamed('partnerFormBasicSection', {
		propertyNames: ['firstName', 'lastName', 'dateOfBirth', 'userEmail'],
		label: "Business Partner basic informations",
		actionUrl: '/',
		statusResolventProperty: 'completionStatus'
	})
);

db.partnerFormSections.sections.add(
	FormSection.newNamed('partnerFormOtherSection', {
		propertyNames: ['companyType', 'inventory', 'surfaceArea', 'isOwner', 'businessActivity'],
		label: "Business Partner secondary informations",
		actionUrl: '/',
		statusResolventProperty: 'completionStatus'
	})
);

partner.formSections.add(db.partnerFormSections);
