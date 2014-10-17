'use strict';

var db                = require('mano').db
  , Percentage        = require('dbjs-ext/number/percentage')(db)
  , User              = require('./user')
  , FormSection       = require('../../model/form-section')(db)
  , FormSectionGroup  = require('../../model/form-section-group')(db)
  , FormEntitiesTable = require('../../model/form-entities-table')(db)
  , TabularEntity     = require('../../model/form-tabular-entity')(db)
  , user, sub1, sub2, tabular1, tabular2, tabular3, tabular4, tables;

module.exports = User;
require('../../model/form-sections')(User);
user = User.prototype;

//temporary helper, cause status is required
user.defineProperties({ statusOfAll: { type: Percentage, value: 1 } });

user.formSections.add(FormSection.newNamed('businessOwnerSection', {
	propertyNames: ['firstName', 'lastName', 'dateOfBirth', 'userEmail', 'street'],
	label: "Business Owner basic informations",
	actionUrl: '/',
	statusResolventProperty: 'statusOfAll'
}));

sub1 = FormSection.newNamed('businessOwnerFirstSubSection', {
	propertyNames: ['companyType', 'members', 'inventory',
		'surfaceArea', 'isOwner', 'businessActivity',
		'registerIds'],
	label: "First Sub Section",
	actionUrl: '/',
	statusResolventProperty: 'statusOfAll'
});

sub2 = FormSection.newNamed('businessOwnerSecondSubSection', {
	propertyNames: ['companyType', 'members',
		'inventory', 'surfaceArea', 'isOwner', 'businessActivity',
		'descriptionText', 'notification', 'isShoppingGallery', 'registerIds'],
	label: 'Second Sub Section',
	actionUrl: '/',
	statusResolventProperty: 'statusOfAll'
});

user.formSections.add(FormSectionGroup.newNamed('businessOwnerGroupSection', {
	label: "Business Owner secondary informations",
	actionUrl: '/',
	statusResolventProperty: 'statusOfAll'
}));

user.formSections.last.sections.add(sub1);
user.formSections.last.sections.add(sub2);

FormEntitiesTable.newNamed('partnersTable', {
	label: 'Directors & non-directors owner / partners',
	formAction: '',
	propertyName: 'partners',
	statusResolventProperty: 'statusOfAll'
});

FormEntitiesTable.newNamed('emptyPartnersTable', {
	label: 'Directors & non-directors owner / partners',
	formAction: '',
	propertyName: 'emptyPartners',
	statusResolventProperty: 'statusOfAll'
});

tables = [db.partnersTable, db.emptyPartnersTable];

tables.forEach(function (table) {
	tabular1 = new TabularEntity({
		propertyName: 'firstName',
		desktopOnly: true
	});

	tabular2 = new TabularEntity({
		propertyName: 'lastName',
		desktopOnly: true
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

user.formSections.add(db.partnersTable);
user.formSections.add(db.emptyPartnersTable);
