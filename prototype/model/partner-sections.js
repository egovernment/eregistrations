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

FormSectionGroup.newNamed('addPartnerSection', {
	label: "Add new Partner",
	actionUrl: '/',
	statusResolventProperty: 'statusOfAll'
});

db.addPartnerSection.sections.add(
	FormSection.newNamed('addPartnerBasicSection', {
		propertyNames: ['firstName', 'lastName', 'dateOfBirth', 'userEmail'],
		label: "Business Partner basic informations",
		actionUrl: '/',
		statusResolventProperty: 'statusOfAll'
	})
);

db.addPartnerSection.sections.add(
	FormSection.newNamed('addPartnerSecondarySection', {
		propertyNames: ['companyType', 'inventory', 'surfaceArea', 'isOwner', 'businessActivity'],
		label: "Business Partner secondary informations",
		actionUrl: '/',
		statusResolventProperty: 'statusOfAll'
	})
);

partner.formSections.add(db.addPartnerSection);
