// Dummy model, used only for purpose of prototype application demo.

'use strict';

var Map          = require('es6-map')
  , db           = require('mano').db
  , d  = require('d')
  , User         = require('../../model/user')(db)
  , Role         = require('mano-auth/model/role')(db)
  , DateType     = require('dbjs-ext/date-time/date')(db)
  , StringLine   = require('dbjs-ext/string/string-line')(db)
  , Email        = require('dbjs-ext/string/string-line/email')(db)
  , UsDollar     = require('dbjs-ext/number/currency/us-dollar')(db)
  , UInteger     = require('dbjs-ext/number/integer/u-integer')(db)
  , SquareMeters = require('dbjs-ext/number/square-meters')(db)
  , Percentage   = require('dbjs-ext/number/percentage')(db)
  , Document     = require('../../model/document')(db)
  , Submission   = require('./submission')
  , File         = require('./file')
  , CompanyType  = require('./company-type')

  , user = User.prototype
  , BusinessActivity, BusinessActivityCategory, Partner, bcAgencyBusiness, bcInsurance
  , file, props
  , StreetTypeChoice
  , EnumTripleOption = require('./enum-triple-option');

db.Base.define('chooseLabel', d("Choose:"));
require('./address');
require('./business-process');
require('dbjs-ext/create-enum')(db);

StreetTypeChoice = db.StreetTypeChoice; // defined in address

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
	label: "Lorem ipsum dolor sit amet",
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

user.defineProperties({
	firstName: { type: StringLine, required: true, label: "First Name", value: "John" },
	lastName: { type: StringLine, required: true, label: "Last Name", value: "Smith" },
	fullName: { type: StringLine, required: true, label: "Full Name", value: function () {
		return this.firstName + ' ' + this.lastName;
	} },

	// Guide
	companyName: { type: StringLine, required: true, label: "Company Name" },
	businessActivity: { type: BusinessActivity, required: true, label: "Business activity" },
	isOwner: { type: db.Boolean, trueLabel: "I am the owner", falseLabel: "I rent it",
		label: "Owner of business premises",
		required: true },
	isLomas: { type: db.Boolean, trueLabel: "Yes", falseLabel: "No",
		label: "Lorem ipsum dolor:",
		required: true },
	isLomasLong: { type: db.Boolean, trueLabel: "Yes", falseLabel: "No",
		label: "Lorem ipsum dolor sit amet, consectetur adipiscing:",
		required: true },
	isType: { type: db.Boolean,
		trueLabel: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit ame",
		falseLabel: "Please choose x docs in the list: " },
	isValidated: { type: db.Boolean,
		trueLabel: "Validate document",
		falseLabel: "Reject document" },
	notification: {
		type: db.StringLine.createEnum('NotificationType', new Map([
			['optionOne', { label: "Use my home address." }],
			['optionTwo', { label: "Use my business address." }],
			['optionTree', { label: "The address for submissions is different" }]
		])),
		label: "Lorem ipsum dolor sit amet"
	},
	isDebtContinusStatus: { type: EnumTripleOption, required: true },
	isManager: { type: db.Boolean, label: "I am manager" },
	inventory: { type: UsDollar, label: "Inventory value", required: true, step: 1,
		inputHint: "Etiam vestibulum dui mi, nec ultrices diam ultricies id " },
	surfaceArea: { type: SquareMeters, label: "Area used for the activity", required: true,
		inputHint: "Etiam vestibulum dui mi, nec ultrices diam ultricies id " },
	members: { type: UInteger, label: "Quantity of members", required: true },
	companyType: { type: CompanyType, label: "Registration type", required: true },
	descriptionText: { type: db.String, label: "Your description", required: true,
		inputCols: 35, inputRows: 4 },
	rejectReason: { type: db.String, inputCols: 35, inputRows: 4 },
	isShoppingGallery: { type: db.Boolean, label: "A shopping gallery", required: true,
		trueLabel: "Yes", falseLabel: "No" },
	isARequested: { type: db.Boolean, label: "Registration A", required: true },
	isBRequested: { type: db.Boolean, label: "Etiam vestibulum dui mi," +
		" nec ultrices diam ultricies id vestibulum dui mi," +
		" nec ultrices diam ultricies id vestibulum dui mi,", required: true },

	dateOfBirth: { type: DateType, label: "Date of birth", required: true,
		value: new Date("October 13, 1984 11:13:00") },
	userEmail: { type: Email, label: "Email", value: 'john.smith@abc.com' },

	registerIds: { type: StringLine, multiple: true, label: "Padrón", pattern: /^\d{8}$/,
		inputMask: '88888888' },
	lomasActivity: { type: BusinessActivity, multiple: true, label: "Business activity:",
		pattern: /^\d{8}$/, inputMask: '88888888' },
	isAffidavitSigned: { type: db.Boolean },
	//Submission
	placeOfWithdraw: { type: StringLine, label: "Withdraw documents to" },
	pickCertificates: { type: db.Boolean, trueLabel: "I will pick the certificates.",
		falseLabel: "The following person will pick the certificates", label: "The following person" },

	incorporationCertificateFile: { type: File, nested: true, label: "Certificate of incorporation" },
	registeredArticlesFile: { type: File, nested: true,
		label: "Registered articles of association" },

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

User.newNamed('notary', {
	firstName: 'User',
	lastName: 'Manager',
	email: 'notary@eregistraions.com',
	roles: ['user'],
	isManager: true
});

User.newNamed('userVianney', {
	firstName: 'Vianney',
	lastName: 'Lesaffre',
	email: 'vianney@lesaffre.com',
	roles: ['users-admin']
});
db.notary.clients.add(db.userVianney);
User.newNamed('otherGuy', {
	firstName: 'Other',
	lastName: 'Not linked',
	email: 'other-guy@lesaffre.com'
});
db.notary.clients.add(db.otherGuy);

db.BusinessProcessNew.instances.forEach(function (businessProcess) {
	db.userVianney.initialBusinessProcesses.add(businessProcess);
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
		surfaceArea: 123,
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
	url: '/uploads/doc-a-sub-file1.idoc.jpg'
});
file.preview = file;
file.thumb.url  =  '/uploads/doc-a-sub-file1.thumb.idoc.jpg';
file.thumb.name = 'idoc.jpg';
user.submissions.documentA.files.add(file);
user.registeredArticlesFile.setProperties(props);
user.registeredArticlesFile.preview = file;

file = db.SubmissionFile.newNamed('docASubFile2', {
	name: 'idoc.png',
	type: 'image/png',
	diskSize: 124998,
	url: '/uploads/doc-a-sub-file2.idoc.png'
});
file.preview = db.JpegFile.newNamed('docASubFile2Preview', {
	url: '/uploads/doc-a-sub-file2.thumb.idoc.png.jpg',
	name: 'idoc.png'
});
file.thumb.url = '/uploads/doc-a-sub-file2.thumb.idoc.png.jpg';
file.thumb.name = 'idoc.png';

user.submissions.documentA.files.add(file);

file = db.SubmissionFile.newNamed('docBSubFile1', {
	name: 'idoc.jpg',
	type: 'image/jpeg',
	diskSize: 426150,
	url: '/uploads/doc-b-sub-file1.idoc.jpg'
});
file.preview = file;
file.thumb.url = '/uploads/doc-b-sub-file1.thumb.idoc.jpg';
file.thumb.name = 'idoc.jpg';

user.submissions.documentB.files.add(file);
