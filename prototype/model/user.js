'use strict';

var Map          = require('es6-map')
  , db           = require('mano').db
  , User         = require('../../model/user')
  , Role         = require('mano-auth/model/role')(db)
  , DateType     = require('dbjs-ext/date-time/date')(db)
  , StringLine   = require('dbjs-ext/string/string-line')(db)
  , Email        = require('dbjs-ext/string/string-line/email')(db)
  , UsDollar     = require('dbjs-ext/number/currency/us-dollar')(db)
  , UInteger     = require('dbjs-ext/number/integer/u-integer')(db)
  , SquareMeters = require('dbjs-ext/number/square-meters')(db)
  , Percentage   = require('dbjs-ext/number/percentage')(db)
  , Document     = require('../../model/document')
  , Submission   = require('./submission')
  , File         = require('./file')

  , user = User.prototype
  , BusinessActivity, BusinessActivityCategory, CompanyType, Partner, bcAgencyBusiness, bcInsurance
  , file, props
  , InventoryValue
  , StreetTypeChoice;

require('dbjs-ext/create-enum')(db);

StreetTypeChoice = StringLine.createEnum('StreetTypeChoice', new Map([
	['street', {
		label: "Street"
	}],
	['avenue', {
		label: "Avenue"
	}],
	['diagonal', {
		label: "Diagonal"
	}],
	['road', {
		label: "Road"
	}]
]));

InventoryValue = db.Object.extend('InventoryValue', {
	description: { type: StringLine },
	value: { type: UsDollar, step: 1, min: 0 }
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
	toString: { value: function (descriptor) { return this.label; } }
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
	lastName: { type: StringLine, required: true, label: "Last Name", value: "Smith" },
	fullName: { type: StringLine, required: true, label: "Full Name", value: function () {
		return this.firstName + ' ' + this.lastName;
	} },

	// Guide
	businessActivity: { type: BusinessActivity, required: true, label: "Business activity" },
	isOwner: { type: db.Boolean, trueLabel: "I am the owner", falseLabel: "I rent it",
		label: "Owner of business premises",
		required: true },
	isType: { type: db.Boolean,
		trueLabel: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit ame",
		falseLabel: "Please choose x docs in the list: " },
	notification: {
		type: db.StringLine.createEnum('NotificationType', new Map([
			['optionOne', { label: "Use my home address." }],
			['optionTwo', { label: "Use my business address." }],
			['optionTree', { label: "The address for submissions is different" }]
		])),
		label: "Lorem ipsum dolor sit amet"
	},
	isManager: { type: db.Boolean, label: "I am manager" },
	inventory: { type: UsDollar, label: "Inventory value", required: true, step: 1,
		inputHint: "Etiam vestibulum dui mi, nec ultrices diam ultricies id " },
	surfaceArea: { type: SquareMeters, label: "Area used for the activity", required: true },
	members: { type: UInteger, label: "Quantity of members", required: true },
	companyType: { type: CompanyType, label: "Registration type", required: true },
	descriptionText: { type: db.String, label: "Your description", required: true,
		inputCols: 35, inputRows: 4 },
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
		falseLabel: "The following person will pick the certificates", label: "The following person" },

	incorporationCertificateFile: { type: File, nested: true, label: "Certificate of incorporation" },
	registeredArticlesFile: { type: File, nested: true,
		label: "Registered articles of association" },

	inventoryShelves: { type: InventoryValue, multiple: true,
		label: "Shelves", inputPlaceholder: "Shelves #1",
		description: "Add lines necessary to mention the cost and source" +
		" of each element. Leave empty if no item." },
	inventoryCounters: { type: InventoryValue, multiple: true,
		label: "Counters", inputPlaceholder: "Counters #1",
		description: "Enter other lines necessary to mention the cost and source" +
		" of each element. Leave empty if no item.",
		addLabel: "Add counter" },
	streetType: { type: StreetTypeChoice, value: 'street', required: true },
	streetName: { type: StringLine, required: true },
	street: { type: StringLine, label: "Type of street", required: true,
		value: function () {
			if (!this.streetType || !this.streetName) return null;
			return this.database.StreetTypeChoice.meta[this.streetType].label + ' ' + this.streetName;
		} },
	shareholdersNumber: { type: UInteger, label: "Shareholders", required: true },
	shareholderAmount: { type: UInteger, label: "Value of share", required: true },
	shares: { type: StringLine, label: "Shares split", required: true,
		value: function () {
			if (!this.shareholdersNumber || !this.shareholderAmount) return null;
			return this.shareholdersNumber + this.shareholderAmount;
		} }
});

module.exports = User;

User.newNamed('userVianney', {
	firstName: 'Vianney',
	lastName: 'Lesaffre',
	email: 'vianney@lesaffre.com',
	roles: ['users-admin']
});

Partner = db.User.extend('Partner', {
	isDirector: { type: db.Boolean, label: "Director?",
		trueLabel: "Yes", falseLabel: "No", value: true },
	isSubscriber: { type: db.Boolean, label: "Subscriber?",
		trueLabel: "Yes", falseLabel: "No", value: true },
	completionStatus: { type: Percentage, value: 1 }
});

user.define('partners', {
	type: Partner,
	multiple: true
});

user.define('emptyPartners', {
	type: Partner,
	multiple: true
});

user.partners.add(Partner.newNamed('partnerFrank',
	{
		firstName: "Frank",
		lastName: "Grozel",
		dateOfBirth: new Date(1960, 0, 1),
		email: "frank@grozel.fr",
		companyType: 'private',
		inventory: 1000000,
		isOwner: true,
		businessActivity: db.baAirCharterAgent,
		members: 5
	}));
user.partners.add(Partner.newNamed('partnerBita', { firstName: "Bita", lastName: "Mortazavi" }));

Submission.extend('DocumentASubmission',
	{ legend: { type: StringLine, value: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." +
		" Duis sodales nec ligula in accumsan. Etiam tempus consequat libero ac facilisis. " } },
	{ Document: { value: Document.extend('DocumentA', {}, { label: { value: "Document A" } }) } });
Submission.extend('DocumentBSubmission',
	{ legend: { type: StringLine, value: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." +
		" Duis sodales nec ligula in accumsan. Etiam tempus consequat libero ac facilisis. " } },
	{ Document: { value: Document.extend('DocumentB', {}, { label: { value: "Document B" } }) } });
Submission.extend('DocumentCSubmission',
	{ legend: { type: StringLine, value: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." +
		" Duis sodales nec ligula in accumsan. Etiam tempus consequat libero ac facilisis. " } },
	{ Document: { value: Document.extend('DocumentC', {}, { label: { value: "Document C" } }) } });

user.define('submissions', {
	type: db.Object,
	nested: true
});
user.submissions.defineProperties({
	documentA: { type: db.DocumentASubmission, nested: true },
	documentB: { type: db.DocumentBSubmission, nested: true },
	documentC: { type: db.DocumentCSubmission, nested: true }
});
user.define('requiredSubmissions', {
	type: db.DocumentSubmission,
	multiple: true,
	value: [user.submissions.documentA, user.submissions.documentB, user.submissions.documentC]
});
user.define('correctionDocuments', {
	type: db.DocumentSubmission,
	multiple: true,
	value: [user.submissions.documentB]
});

file = db.SubmissionFile.newNamed('docASubFile1', props = {
	name: 'idoc.jpg',
	type: 'image/jpeg',
	diskSize: 376306,
	url: '/uploads/docASubFile1.idoc.jpg'
});
file.preview = file;
file.thumb = db.JpegFile.newNamed('docASubFile1Thumb', {
	url: '/uploads/docASubFile1.thumb.idoc.jpg',
	name: 'idoc.jpg'
});
user.submissions.documentA.files.add(file);
user.registeredArticlesFile.setProperties(props);
user.registeredArticlesFile.preview = file;
user.registeredArticlesFile.thumb = file.thumb;

file = db.SubmissionFile.newNamed('docASubFile2', {
	name: 'idoc.png',
	type: 'image/png',
	diskSize: 124998,
	url: '/uploads/docASubFile2.idoc.png'
});
file.preview = db.JpegFile.newNamed('docASubFile2Preview', {
	url: '/uploads/docASubFile2.thumb.idoc.png.jpg',
	name: 'idoc.png'
});
file.thumb = db.JpegFile.newNamed('docASubFile2Thumb', {
	url: '/uploads/docASubFile2.thumb.idoc.png.jpg',
	name: 'idoc.png'
});
user.submissions.documentA.files.add(file);

file = db.SubmissionFile.newNamed('docBSubFile1', {
	name: 'idoc.jpg',
	type: 'image/jpeg',
	diskSize: 426150,
	url: '/uploads/docBSubFile1.idoc.jpg'
});
file.preview = file;
file.thumb = db.JpegFile.newNamed('docBSubFile1Thumb', {
	url: '/uploads/docBSubFile1.thumb.idoc.jpg',
	name: 'idoc.jpg'
});
user.submissions.documentB.files.add(file);
