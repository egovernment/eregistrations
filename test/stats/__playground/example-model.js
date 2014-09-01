'use strict';

var Map          = require('es6-map')
  , db           = require('mano').db
  , User         = require('mano-auth/model/user')(db)
  , Role         = require('mano-auth/model/role')
  , DateType     = require('dbjs-ext/date-time/date')(db)
  , StringLine   = require('dbjs-ext/string/string-line')(db)
  , Email        = require('dbjs-ext/string/string-line/email')(db)
  , UsDollar     = require('dbjs-ext/number/currency/us-dollar')(db)
  , UInteger     = require('dbjs-ext/number/integer/u-integer')(db)
  , SquareMeters = require('dbjs-ext/number/square-meters')(db)

  , user = User.prototype
  , BusinessActivity, BusinessActivityCategory, CompanyType, Partner, bcAgencyBusiness, bcInsurance;

require('dbjs-ext/create-enum')(db);

User.defineProperties({
	minDirectors: {
		type: db.Number,
		value: 2
	},
	minSubscribers: {
		type: db.Number,
		value: 2
	}
});

Role.members.add('user');
Role.meta.get('user').setProperties({
	label: "Self employed"
});
Role.members.add('users-admin');
Role.meta.get('users-admin').setProperties({
	label: "Users Admin"
});
Role.members.add('meta-admin');
Role.meta.get('meta-admin').setProperties({
	label: "Meta Admin"
});
Role.members.add('demo-user');
Role.meta.get('demo-user').setProperties({
	label: "Demo User"
});
Role.members.add('official-revision');
Role.meta.get('official-revision').setProperties({
	label: "Revision"
});
Role.members.add('official-processing');
Role.meta.get('official-processing').setProperties({
	label: "Processing"
});
Role.members.add('official-registration');
Role.meta.get('official-registration').setProperties({
	label: "Registration"
});

BusinessActivityCategory = db.Object.extend('BusinessActivityCategory', {
	label: { type: StringLine, required: true }
});
bcAgencyBusiness = BusinessActivityCategory.newNamed('bcAgencyBusiness',
	{ label: "Agency Business" });
bcInsurance = BusinessActivityCategory.newNamed('bcInsurance', { label: "Insurance" });

BusinessActivity = db.Object.extend('BusinessActivity', {
	label: { type: StringLine, required: true },
	category: { type: BusinessActivityCategory, required: true },
	toString: { value: function (/* ignore */) {
		return this.label;
	} }
});

BusinessActivity.newNamed('baComissionAgent', {
	label: "Comission agent",
	category: bcAgencyBusiness
});
BusinessActivity.newNamed('baAirCharterAgent', {
	label: "Air charter agent",
	category: bcAgencyBusiness
});
BusinessActivity.newNamed('baGeneralInsurance', {
	label: "General insurance and assurance",
	category: bcInsurance
});
BusinessActivity.newNamed('baReassurance', {
	label: "Re-assurance & endowment",
	category: bcInsurance
});

CompanyType = StringLine.createEnum('CompanyType', new Map([
	['private', { label: "Private limited company" }],
	['public', { label: "Public company" }]
]));

user.defineProperties({
	firstName: { type: StringLine, required: true, label: "First Name" },
	lastName: { type: StringLine, required: true, label: "Last Name" },

	// Guide
	businessActivity: { type: BusinessActivity, required: true, label: "Business activity" },
	isOwner: { type: db.Boolean, trueLabel: "I am the owner", falseLabel: "I rent it",
		label: "Owner of business premises" },
	isManager: { type: db.Boolean, label: "I am manager" },
	inventory: { type: UsDollar, label: "Inventory value", required: true, step: 1, statsBase: null },
	surfaceArea: { type: SquareMeters, label: "Area used for the activity", required: true },
	members: { type: UInteger, label: "Quantity of members", required: true },
	companyType: { type: CompanyType, label: "Registration type", required: true },
	isShoppingGallery: { type: db.Boolean, label: "A shopping gallery", required: true,
		trueLabel: "Yes", falseLabel: "No" },
	isARequested: { type: db.Boolean, label: "Registration A", required: true },
	isBRequested: { type: db.Boolean, label: "Etiam vestibulum dui mi," +
		" nec ultrices diam ultricies id vestibulum dui mi," +
		" nec ultrices diam ultricies id vestibulum dui mi,", required: true },

	dateOfBirth: { type: DateType, label: "Date of birth", required: true },
	userEmail: { type: Email, label: "Email" },

	registerIds: { type: StringLine, multiple: true, label: "Padrón", pattern: /^\d{8}$/,
		inputMask: '88888888' },
	isAffidavitSigned: { type: db.Boolean },
	//Submission
	placeOfWithdraw: { type: StringLine, label: "Withdraw documents to" },
	pickCertificates: { type: db.Boolean, trueLabel: "I will pick the certificates.",
		falseLabel: "The following person will pick the certificates", label: "The following person" }
});

module.exports = db;

User.newNamed('userVianney', {
	firstName: 'Vianney',
	lastName: 'Lesaffre',
	email: 'vianney@lesaffre.com',
	roles: ['users-admin']
});

Partner = db.User.extend('Partner', {
	fee: { type: UsDollar, value: function () {},
		statsBase: 0 }
});

user.define('partners', {
	type: Partner,
	statsBase: null,
	multiple: true
});

user.partners.add(Partner.newNamed('partnerFrank',
	{
		firstName: "Frank",
		lastName: "Grozel",
		dateOfBirth: "01.01.1960",
		email: "frank@grozel.fr",
		companyType: 'private',
		inventory: 1000000,
		isOwner: true,
		businessActivity: db.baAirCharterAgent,
		members: 5

	}));
user.partners.add(Partner.newNamed('partnerBita', { firstName: "Bita", lastName: "Mortazavi" }));

user.define('submissions', {
	type: db.Object,
	nested: true
});
