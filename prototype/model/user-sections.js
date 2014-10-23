'use strict';

var db                = require('mano').db
  , Percentage        = require('dbjs-ext/number/percentage')(db)
  , User              = require('./user')
  , FormSection       = require('../../model/form-section')(db)
  , FormSectionGroup  = require('../../model/form-section-group')(db)
  , FormEntitiesTable = require('../../model/form-entities-table')(db)
  , TabularEntity     = require('../../model/form-tabular-entity')(db)
  , user, tabular1, tabular2, tabular3, tabular4, tables;

module.exports = User;
require('../../model/form-sections')(User, 'formSections');
require('../../model/form-sections')(User, 'formSendSections');
user = User.prototype;

//temporary helper, cause status is required
user.defineProperties({ completionStatus: { type: Percentage, value: 1 } });

FormSection.extend('BusinessOwnerSection', {}, {
	actionUrl: { value: '/' },
	label: { value: "Business Owner basic information" },
	propertyNames: { value: ['firstName', 'lastName', 'dateOfBirth',
		'userEmail', 'street', 'shares'] }
});

user.formSections.getOwnDescriptor('businessOwnerSection').type = db.BusinessOwnerSection;

FormSection.extend('BusinessOwnerFirstSubSection', {}, {
	propertyNames: { value: ['companyType', 'members', 'inventory',
		'surfaceArea', 'isOwner', 'businessActivity',
		'registerIds', 'shares'] },
	label: { value: "First Sub Section" },
	actionUrl: { value: '/' }
});

FormSection.extend('BusinessOwnerSecondSubSection', {}, {
	propertyNames: { value: ['companyType', 'members',
		'inventory', 'surfaceArea', 'isOwner', 'businessActivity',
		'descriptionText', 'notification', 'isShoppingGallery', 'registerIds'] },
	label: { value: "Second Sub Section" },
	actionUrl: { value: '/' }
});

FormSectionGroup.extend('BusinessOwnerGroupSection', {}, {
	label: { value: "Business Owner secondary informations" },
	actionUrl: { value: '/' }
});

user.formSections.getOwnDescriptor('businessOwnerGroupSection').type = db.BusinessOwnerGroupSection;

user.formSections.businessOwnerGroupSection.sections.
	getOwnDescriptor('businessOwnerFirstSubSection').type = db.BusinessOwnerFirstSubSection;

user.formSections.businessOwnerGroupSection.sections.
	getOwnDescriptor('businessOwnerSecondSubSection').type = db.BusinessOwnerSecondSubSection;

FormEntitiesTable.extend('PartnersTable', {}, {
	label: { value: 'Directors & non-directors owner / partners' },
	baseUrl: { value: 'partner' },
	entityTitleProperty: { value: 'fullName' },
	propertyName: { value: 'partners' }
});

FormEntitiesTable.extend('EmptyPartnersTable', {}, {
	label: { value: 'Directors & non-directors owner / partners' },
	baseUrl: { value: 'partner' },
	entityTitleProperty: { value: 'fullName' },
	propertyName: { value: 'emptyPartners' }
});

tables = [db.PartnersTable, db.EmptyPartnersTable];

tables.forEach(function (table) {
	tabular1 = new TabularEntity({
		propertyName: 'firstName'
	});

	tabular2 = new TabularEntity({
		propertyName: 'lastName'
	});

	tabular3 = new TabularEntity({
		propertyName: 'isDirector',
		desktopOnly: true
	});

	tabular4 = new TabularEntity({
		propertyName: 'isSubscriber',
		desktopOnly: true
	});
	table.entities.add(tabular1);
	table.entities.add(tabular2);
	table.entities.add(tabular3);
	table.entities.add(tabular4);
});

user.formSections.getOwnDescriptor('partnersTable').type = db.PartnersTable;
user.formSections.getOwnDescriptor('emptyPartnersTable').type = db.EmptyPartnersTable;

FormSection.extend('WithdrawToSection', {}, {
	propertyNames: { value: ['placeOfWithdraw'] },
	label: { value: "Where do you want to withdraw your documents?" },
	actionUrl: { value: '/' }
});

FormSection.extend('WhoWithdrawsSection', {}, {
	propertyNames: { value: ['lastName', 'dateOfBirth', 'inventory'] },
	label: { value: "Who will pick the certificates?" },
	actionUrl: { value: '/' },
	resolventProperty: { value: 'pickCertificates' },
	resolventValue: { value: false }
});

user.formSendSections.getOwnDescriptor('withdrawToSection').type = db.WithdrawToSection;
user.formSendSections.getOwnDescriptor('whoWithdrawsSection').type = db.WhoWithdrawsSection;
