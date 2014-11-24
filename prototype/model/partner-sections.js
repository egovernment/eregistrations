'use strict';

var db          = require('mano').db
  , Partner     = db.Partner
  , FormSection = require('../../model/form-section')(db)
  , FormSectionGroup = require('../../model/form-section-group')(db)
  , partner;

partner = Partner.prototype;

require('../../model/form-sections')(Partner, 'partnerFormSections');

FormSectionGroup.extend('PartnerFormSectionGroup', {}, {
	actionUrl: { value: '/' }
});

partner.partnerFormSections.getOwnDescriptor('partnerFormSectionGroup').type =
	db.PartnerFormSectionGroup;

FormSection.extend('PartnerFormBasicSection', {
	label: { value: "Business Partner basic informations" }
}, {
	propertyNames: { value: ['firstName', 'lastName', 'dateOfBirth', 'userEmail'] },
	actionUrl: { value: '/' }
});

partner.partnerFormSections.partnerFormSectionGroup.sections.
	getOwnDescriptor('partnerFormBasicSection').type = db.PartnerFormBasicSection;

FormSection.extend('PartnerFormOtherSection', {
	label: { value: "Business Partner secondary informations" }
}, {
	propertyNames: { value: ['companyType', 'inventory', 'surfaceArea',
		'isOwner', 'businessActivity'] },
	actionUrl: { value: '/' }
});

partner.partnerFormSections.partnerFormSectionGroup.sections.
	getOwnDescriptor('partnerFormOtherSection').type = db.PartnerFormOtherSection;
