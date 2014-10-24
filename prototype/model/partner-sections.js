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

FormSection.extend('PartnerFormBasicSection', {}, {
	propertyNames: { value: ['firstName', 'lastName', 'dateOfBirth', 'userEmail'] },
	label: { value: "Business Partner basic informations" },
	actionUrl: { value: '/' }
});

partner.partnerFormSections.partnerFormSectionGroup.sections.
	getOwnDescriptor('partnerFormBasicSection').type = db.PartnerFormBasicSection;

FormSection.extend('PartnerFormOtherSection', {}, {
	propertyNames: { value: ['companyType', 'inventory', 'surfaceArea',
		'isOwner', 'businessActivity'] },
	label: { value: "Business Partner secondary informations" },
	actionUrl: { value: '/' }
});

partner.partnerFormSections.partnerFormSectionGroup.sections.
	getOwnDescriptor('partnerFormOtherSection').type = db.PartnerFormOtherSection;
