'use strict';

var Map          = require('es6-map')
  , db           = require('mano').db
  , User         = require('mano-auth/model/user')
  , DateType     = require('dbjs-ext/date-time/date')(db)
  , StringLine   = require('dbjs-ext/string/string-line')(db)
  , Email        = require('dbjs-ext/string/string-line/email')(db)
  , UsDollar     = require('dbjs-ext/number/currency/us-dollar')(db)
  , UInteger     = require('dbjs-ext/number/integer/u-integer')(db)
  , SquareMeters = require('dbjs-ext/number/square-meters')(db)
  , Document     = require('./document')
  , Submission   = require('./submission')

  , user = User.prototype
  , BusinessActivity, BusinessActivityCategory, CompanyType, Partner, bcAgencyBusiness, bcInsurance
  , file;

require('dbjs-ext/create-enum')(db);

BusinessActivityCategory = db.Object.extend('BusinessActivityCategory', {
	label: { type: StringLine, required: true }
});
bcAgencyBusiness = BusinessActivityCategory.newNamed('bcAgencyBusiness',
	{ label: "Agency Business" });
bcInsurance = BusinessActivityCategory.newNamed('bcInsurance', { label: "Insurance" });

BusinessActivity = db.Object.extend('BusinessActivity', {
	label: { type: StringLine, required: true },
	category: { type: BusinessActivityCategory, required: true }
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
	inventory: { type: UsDollar, label: "Inventory value", required: true, step: 1 },
	surfaceArea: { type: SquareMeters, label: "Area used for the activity", required: true },
	members: { type: UInteger, label: "Quantity of members", required: true },
	companyType: { type: CompanyType, label: "Registration type", required: true },
	isShoppingGallery: { type: db.Boolean, label: "A shopping gallery", required: true,
		trueLabel: "Yes", falseLabel: "No" },
	isARequested: { type: db.Boolean, label: "Registration A", required: true },
	isBRequested: { type: db.Boolean, label: "Registration B", required: true },

	dateOfBirth: { type: DateType, label: "Date of birth", required: true },
	userEmail: { type: Email, label: "Email" },

	registerIds: { type: StringLine, multiple: true, label: "Padrón", pattern: /^\d{8}$/,
		inputMask: '88888888' },
	isAffidavitSigned: { type: db.Boolean },
	//Submission
	placeOfWithdraw: { type: StringLine, label: "Withdraw documents to" },
	pickCertificates: { type: db.Boolean, trueLabel: "I will pick the certificates.",
		falseLabel: "he following person will pick the certificates", label: "The following person:" }
});

module.exports = User;

Partner = db.User.extend('Partner');

user.define('partners', {
	type: Partner,
	multiple: true
});

user.partners.add(new Partner({ firstName: "Frank", lastName: "Grozel" }));
user.partners.add(new Partner({ firstName: "Bita", lastName: "Mortazavi" }));

Submission.extend('DocumentASubmission', {},
	{ Document: { value: Document.extend('DocumentA', {}, { label: { value: "Document A" } }) } });
Submission.extend('DocumentBSubmission', {},
	{ Document: { value: Document.extend('DocumentB', {}, { label: { value: "Document B" } }) } });
Submission.extend('DocumentCSubmission', {},
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

file = db.SubmissionFile.newNamed('docASubFile1', {
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
