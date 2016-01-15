// A mock model based on new business-process

'use strict';

var db = require('mano').db
  , BusinessProcessNew = require('../../model/business-process-new')(db,
		{ className: 'BusinessProcessNew' })
  , first       = BusinessProcessNew.newNamed('firstBusinessProcess')
  , second      = BusinessProcessNew.newNamed('secondBusinessProcess')
  , third       = BusinessProcessNew.newNamed('thirdBusinessProcess')
  , fourth      = BusinessProcessNew.newNamed('fourthBusinessProcess')
  , fifth       = BusinessProcessNew.newNamed('fifthBusinessProcess')
  , UInteger    = require('dbjs-ext/number/integer/u-integer')(db)
  , StringLine  = require('dbjs-ext/string/string-line')(db)
  , USDollar  = require('dbjs-ext/number/currency/us-dollar')(db)
  , Person      = require('../../model/person')(db)
  , DateType    = require('dbjs-ext/date-time/date')(db)
  , FormSection = require('../../model/form-section')(db)
  , CompanyType = require('./company-type')
  , FormSectionGroup = require('../../model/form-section-group')(db)
  , FormEntitiesTable = require('../../model/form-entities-table')(db)
  , TabularEntity = require('../../model/form-tabular-entity')(db)
  , Registration = require('../../model/registration-new')(db)
  , Document = require('../../model/document')(db)
  , Address  = require('./address')
  , Branch   = require('./branch')
  , StatusLog = require('../../model/lib/status-log')(db)
  , DeterminantSection
  , defineCertificates = require('../../model/business-process-new/utils/define-certificates')
  , defineRequirements = require('../../model/business-process-new/utils/define-requirements')
  , defineRequirementUploads =
			require('../../model/business-process-new/utils/define-requirement-uploads')
  , RevisionProcessingStep = require('../../model/processing-steps/revision')(db)
  , DocA
  , DocB
  , IdDoc
  , RequiredUploadA
  , Representative
  , File = require('../../model/file')(db)
  , processes = [first, second, third, fourth, fifth]
  , paymentReceipt = require('../../model/business-process-new/' +
		'utils/define-payment-receipt-uploads')
  , Institution = require('../../model/institution')(db)
  , FrontDeskProcessingStep = require('../../model/processing-steps/front-desk')(db);

db.Cost.prototype.getDescriptor('amount').type = USDollar;
db.Cost.prototype.getDescriptor('sideAmount').type = USDollar;
db.BusinessProcessNew.prototype.costs.getDescriptor('totalAmount').type = USDollar;

require('./inventory');
require('../../model/business-process-new/submission-forms');
Institution.newNamed('institutionOfficialMinistry');
Institution.newNamed('institutionCommerceMinistry');
db.institutionOfficialMinistry.name = "Official Ministry";
db.institutionCommerceMinistry.name = "Commerce Ministry";
FrontDeskProcessingStep.prototype.possibleInstitutions.add(db.institutionOfficialMinistry);
FrontDeskProcessingStep.prototype.possibleInstitutions.add(db.institutionCommerceMinistry);
require('../../model/lib/nested-map');
BusinessProcessNew.newNamed('emptyBusinessProcess');

module.exports = BusinessProcessNew;

Representative = Person.extend('Representative', {
	address: {
		type: Address,
		nested: true
	},
	dateOfBirth: {
		type: DateType,
		label: "Date of birth",
		required: true,
		value: new Date("October 13, 1984 11:13:00")
	},
	isMarried: {
		type: db.Boolean,
		required: true,
		label: "Are you married?"
	},
	spouseName: {
		type: StringLine,
		required: true,
		label: "Spouse name"
	},
	spouseLastName: {
		type: StringLine,
		required: true,
		label: "Spouse last name"
	},
	idPhoto: {
		type: File,
		nested: true,
		label: "Photo file"
	}
});

Representative.prototype.idPhoto.setProperties({
	name: 'idoc.jpg',
	type: 'image/jpeg',
	diskSize: 376306,
	path: 'doc-a-sub-file1.idoc.jpg',
	url: '/uploads/doc-a-sub-file1.idoc.jpg'
});

Representative.prototype.idPhoto.thumb.url = '/uploads/doc-a-sub-file1.idoc.jpg';

BusinessProcessNew.prototype.defineProperties({
	//guide
	isCompany: {
		type: db.Boolean,
		required: true,
		label: "Is company?"
	},
	needsSpecialCommittee: {
		type: db.Boolean,
		required: true,
		label: "Do you need validation by special committee?"
	},
	branchCount: {
		type: UInteger,
		required: true,
		label: "How many branches?",
		inputOptionalInfo: "Only branches in the same country"
	},
	inventoryTotalAmount: {
		label: "Value of inventory",
		isInventoryTotal: true,
		type: UInteger,
		inputOptionalInfo: "Enter total amount of all owned products"
	},
	//dataForms
	companyType: {
		type: CompanyType,
		required: true,
		label: "Company type"
	},
	companyName: {
		type: StringLine,
		required: true,
		label: "Company Name"
	},
	rangeOfActivity: {
		type: db.String,
		label: "Economic activity",
		inputHint: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor " +
			"incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud " +
			"exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure " +
			"dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. " +
			"Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit " +
			"anim id est laborum"
	},
	hasEmployees: {
		type: db.Boolean,
		required: true,
		label: "Do you have employees?"
	},
	employeesCount: {
		type: UInteger,
		required: true,
		label: "How many employees do you have?"
	},
	isAddressSameAsPersonal: {
		type: db.Boolean,
		required: true,
		label: "Is company address the same as the representative's?"
	},
	businessAddress: Address,
	// submissionForms
	placeOfWithdraw: {
		type: StringLine,
		label: "Withdraw documents to"
	},
	pickCertificates: {
		type: db.Boolean,
		trueLabel: "I will pick the certificates.",
		falseLabel: "The following person will pick the certificates",
		label: "The following person"
	}
});

BusinessProcessNew.prototype.getDescriptor('representative').type = Representative;

BusinessProcessNew.prototype.defineNestedMap('branches', {
	cardinalPropertyKey: "companyName",
	itemType: Branch
});

DocA = Document.extend('DocA', {}, {
	abbr: { value: "DOC-A" },
	label: { value: "Document A" },
	legend: { value: "This document is issued as a result of Registration A" }
});

DocB = Document.extend('DocB', {}, {
	abbr: { value: "DOC-B" },
	label: { value: "Document B" },
	legend: { value: "This document is issued as a result of Registration B" }
});

IdDoc = Document.extend('IdDoc', {}, {
	label: { value: "Identification document" },
	legend: { value: "This a requiredUpload for all registrations" }
});

RequiredUploadA = Document.extend('RequiredUploadA', {}, {
	label: { value: "Required upload A" },
	legend: { value: "This upload is required in case of registration A" }
});

defineCertificates(BusinessProcessNew, [DocA, DocB]);
defineRequirements(BusinessProcessNew, [IdDoc, RequiredUploadA]);
defineRequirementUploads(BusinessProcessNew, [IdDoc, RequiredUploadA]);

BusinessProcessNew.prototype.costs.map.define('handlingFee', {
	nested: true
});

BusinessProcessNew.prototype.costs.map.handlingFee.setProperties({
	amount: 70,
	label: "Handling fee",
	legend: "Lorem ipsum dolor sit amet"
});

paymentReceipt(BusinessProcessNew,
	{ handlingFee:  { label: "Handling fee receipt", legend: "Handling fee legend",
		costs: [BusinessProcessNew.prototype.costs.map.handlingFee],
		issueDate: new Date(2015, 27, 7) } });

BusinessProcessNew.prototype.registrations.map.define('a', { type: Registration, nested: true });
BusinessProcessNew.prototype.registrations.map.get('a').setProperties({
	label: "Registration A",
	shortLabel: "A",
	abbr: 'REGA',
	costs: function () {
		return [this.master.costs.map.handlingFee];
	},
	certificates: function () {
		return [this.master.certificates.map.docA];
	},
	requirements: function () {
		return [this.master.requirements.map.idDoc, this.master.requirements.map.requiredUploadA];
	}
});

BusinessProcessNew.prototype.registrations.map.define('b', { type: Registration, nested: true });
BusinessProcessNew.prototype.registrations.map.get('b').setProperties({
	label: "Registration B",
	shortLabel: "B",
	abbr: 'REGB',
	certificates: function () {
		return [this.master.certificates.map.docB];
	},
	requirements: function () {
		return [this.master.requirements.map.idDoc];
	}
});

DeterminantSection = FormSection.extend('DeterminantSection', {
	label: { value: "Determinants" },
	propertyNames: { value: ['isCompany', 'inventoryTotalAmount',
		'needsSpecialCommittee', 'branchCount'] }
});

BusinessProcessNew.prototype.getDescriptor('determinants').type = DeterminantSection;

BusinessProcessNew.prototype.statusLog.map.define('received', {
	type: StatusLog
});
BusinessProcessNew.prototype.statusLog.map.define('revieved', {
	type: StatusLog
});
BusinessProcessNew.prototype.statusLog.map.define('rejected', {
	type: StatusLog
});

BusinessProcessNew.prototype.certificates.map.define('', {});

processes.forEach(function (businessProcess) {
	businessProcess.representative.firstName = "Johny";
	businessProcess.representative.lastName = "Doe";
	businessProcess.branchCount = 2;
	businessProcess.isCompany = false;
	businessProcess.needsSpecialCommittee = true;
	businessProcess.businessName = businessProcess.representative.fullName;
	businessProcess.representative.dateOfBirth = new Date(1982, 2, 12);
	businessProcess.representative.isMarried = true;
	businessProcess.representative.spouseName = 'Alexis';
	businessProcess.representative.spouseLastName = 'Colby';
	businessProcess.representative.address.city = 'London';
	businessProcess.representative.address.streetType = 'street';
	businessProcess.representative.address.streetName = 'Cherry Tree Lane';
	businessProcess.representative.address.streetNumber = '17';
	businessProcess.representative.address.apartmentNumber = '50';
	businessProcess.rangeOfActivity = 'Commerce';
	businessProcess.companyType = 'private';
	businessProcess.companyName = 'Dads & Sons';
	businessProcess.hasEmployees = true;
	businessProcess.employeesCount = 3;
	businessProcess.isAddressSameAsPersonal = true;
	// new
	businessProcess.label = 'Revision';
	businessProcess.submissionForms.isAffidavitSigned = true;
	// status logs
	businessProcess.statusLog.map.get('received').setProperties({
		label: 'Documents received',
		time: new Date(2015, 27, 7),
		text: 'Lorem ipsum dolor sit'
	});
	businessProcess.statusLog.map.get('reviewed').setProperties({
		label: 'Documents reviewed',
		time: new Date(2015, 27, 7),
		text: 'Lorem ipsum dolor sit'
	});
	businessProcess.statusLog.map.get('rejected').setProperties({
		label: 'Documents rejected',
		time: new Date(2015, 27, 7),
		text: 'Lorem ipsum dolor sit'
	});

	businessProcess.isApproved = true;
	businessProcess.branches.map.get('first').setProperties({
		companyName: "First Branch inc.",
		isFranchise: true,
		isActivitySameAsMotherCompany: true
	});
	businessProcess.branches.map.get('first').responsiblePerson.firstName = "Bruce";
	businessProcess.branches.map.get('first').responsiblePerson.lastName = "Wayne";
	businessProcess.branches.map.get('first').responsiblePerson.email = "batman@gotham.com";

	businessProcess.branches.map.get('second').setProperties({
		companyName: "Second Branch inc.",
		isFranchise: true,
		isActivitySameAsMotherCompany: true
	});
	businessProcess.branches.map.get('second').responsiblePerson.firstName = "Peter";
	businessProcess.branches.map.get('second').responsiblePerson.lastName = "Parker";
	businessProcess.branches.map.get('second').responsiblePerson.email = "spiderman@daily-bugle.com";

	businessProcess.certificates.applicable.forEach(function (certificate, index) {
		certificate.label = 'Certyficate label';
		certificate.issuedBy = db.institutionOfficialMinistry;
		certificate.issueDate = new Date(2015, 23, 7);
		certificate.files.map.get('cert' + index).setProperties({
			name: 'idoc.jpg',
			type: 'image/jpeg',
			diskSize: 376306,
			path: 'doc-a-sub-file1.idoc.jpg',
			url: '/uploads/doc-a-sub-file1.idoc.jpg'
		});
	});

	businessProcess.paymentReceiptUploads.applicable.first.document
		.statusLog.map.get('received').setProperties({
			label: 'Payment receipt received',
			time: new Date(2015, 27, 7),
			text: 'Lorem ipsum dolor sit'
		});
	businessProcess.paymentReceiptUploads.applicable.first.document
		.statusLog.map.get('rejected').setProperties({
			label: 'Payment receipt rejected',
			time: new Date(2015, 27, 7),
			text: 'Lorem ipsum dolor sit'
		});

	businessProcess.paymentReceiptUploads.applicable.first.document
		.statusLog.map.get('reviewed').setProperties({
			label: 'Payment receipt reviewed',
			time: new Date(2015, 27, 7),
			text: 'Lorem ipsum dolor sit'
		});

	businessProcess.requirementUploads.applicable.forEach(function (upload) {
		upload.document.issueDate = new Date(2015, 23, 7);
	});
	businessProcess.requirementUploads.applicable.first.document
		.statusLog.map.get('received').setProperties({
			label: 'Document received',
			time: new Date(2015, 27, 7),
			text: 'Lorem ipsum dolor sit'
		});
	businessProcess.requirementUploads.applicable.first.document
		.statusLog.map.get('rejected').setProperties({
			label: 'Document rejected',
			time: new Date(2015, 27, 7),
			text: 'Lorem ipsum dolor sit'
		});

	businessProcess.requirementUploads.applicable.first.document
		.statusLog.map.get('reviewed').setProperties({
			label: 'Document reviewed',
			time: new Date(2015, 27, 7),
			text: 'Lorem ipsum dolor sit'
		});

	businessProcess.paymentReceiptUploads.applicable.first.document.files.map.
			get('idDoc').setProperties({
			name: 'idoc.jpg',
			type: 'image/jpeg',
			diskSize: 376306,
			path: 'doc-a-sub-file1.idoc.jpg',
			url: '/uploads/doc-a-sub-file1.idoc.jpg'
		});
	businessProcess.paymentReceiptUploads.applicable.first.document.files.map.
			get('idDoc').thumb.url = '/uploads/doc-a-sub-file1.idoc.jpg';

	businessProcess.requirementUploads.applicable.first.document.files.map.
			get('idDoc').setProperties({
			name: 'idoc.jpg',
			type: 'image/jpeg',
			diskSize: 376306,
			path: 'doc-a-sub-file1.idoc.jpg',
			url: '/uploads/doc-a-sub-file1.idoc.jpg'
		});
	businessProcess.requirementUploads.applicable.first.document.files.map.
			get('idDoc').thumb.url = '/uploads/doc-a-sub-file1.idoc.jpg';
	businessProcess.requirementUploads.applicable.last.document.files.map.
			get('idDoc').setProperties({
			name: 'idoc.png',
			type: 'image/png',
			diskSize: 124998,
			path: 'doc-a-sub-file2.idoc.png',
			url: '/uploads/doc-a-sub-file2.idoc.png'
		});
	businessProcess.requirementUploads.applicable.last.document.files.map.
			get('idDoc').thumb.url = '/uploads/doc-a-sub-file2.idoc.png';

	businessProcess.processingSteps.map.define('revision', {
		nested: true,
		type: RevisionProcessingStep
	});

	businessProcess.processingSteps.map.define('frontDesk', {
		nested: true,
		type: require('../../model/processing-steps/front-desk')(db)
	});

	businessProcess.processingSteps.map.define('processing', {
		nested: true,
		type: require('../../model/processing-step')(db)
	});
});

// Submision sections

BusinessProcessNew.prototype.submissionForms.map.define('pickupInstitution', {
	nested: true,
	type: require('../../model/business-process-new/submission-forms/pickup-institution')(db)
});

BusinessProcessNew.prototype.submissionForms.map.define('certificates', {
	type: FormSection,
	nested: true
});
BusinessProcessNew.prototype.submissionForms.map.get('certificates').setProperties({
	propertyNames: ['pickCertificates'],
	label: "Who will pick the certificates?"
});

// Sections
BusinessProcessNew.prototype.dataForms.map.define('personal', {
	type: FormSection,
	nested: true
});

BusinessProcessNew.prototype.dataForms.map.get('personal').setProperties({
	propertyNames: ['representative/firstName', 'representative/lastName',
		'representative/dateOfBirth', 'representative/isMarried',
		'representative/spouseName', 'representative/spouseLastName',
		'representative/address/city', 'representative/address/streetType',
		'representative/address/streetName', 'representative/address/streetNumber',
		'representative/address/apartmentNumber', 'representative/idPhoto'],
	label: "Company's representative information",
	legend: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor " +
		"incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud " +
		"exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor " +
		"in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur " +
		"sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est " +
		"laborum"
});

BusinessProcessNew.prototype.dataForms.map.define('company', {
	type: FormSectionGroup,
	nested: true
});

BusinessProcessNew.prototype.dataForms.map.get('company').setProperties({
	label: "Company information",
	pageUrl: 'company-informations'
});

BusinessProcessNew.prototype.dataForms.map.get('company').sections.define('details', {
	type: FormSection,
	nested: true
});
BusinessProcessNew.prototype.dataForms.map.get('company').sections.define('address', {
	type: FormSection,
	nested: true
});

BusinessProcessNew.prototype.dataForms.map.get('company').sections.get('details').setProperties({
	label: "Company details",
	propertyNames: ['rangeOfActivity', 'companyType', 'companyName', 'hasEmployees', 'employeesCount']
});

BusinessProcessNew.prototype.dataForms.map.get('company').sections.get('address').setProperties({
	label: "Company address",
	resolventProperty: "isAddressSameAsPersonal",
	propertyNames: ['businessAddress/city', 'businessAddress/streetType',
		'businessAddress/streetType', 'businessAddress/streetName',
		'businessAddress/street', 'businessAddress/streetNumber',
		'businessAddress/apartmentNumber']
});

// Forms sides section

BusinessProcessNew.prototype.dataForms.map.define('sides', {
	type: FormSectionGroup,
	nested: true
});

BusinessProcessNew.prototype.dataForms.map.get('sides').setProperties({
	label: "Business Owner sides informations",
	legend: "All sides informations requested",
	pageUrl: 'sides'
});

BusinessProcessNew.prototype.dataForms.map.get('sides').sections.defineProperties({
	details: {
		type: FormSection,
		nested: true
	},
	first: {
		type: FormSection,
		nested: true
	},
	second: {
		type: FormSection,
		nested: true
	}
});

BusinessProcessNew.prototype.dataForms.map.get('sides').sections.get('first').setProperties({
	label: "First Sub Section"
});

BusinessProcessNew.prototype.dataForms.map.get('sides').sections.get('second').setProperties({
	label: "Second Sub Section"
});

BusinessProcessNew.prototype.dataForms.map.define('branches', {
	type: FormEntitiesTable,
	nested: true
});

BusinessProcessNew.prototype.dataForms.map.get('branches').setProperties({
	min: function () {
		return this.branchCount;
	},
	max: function () {
		return this.min;
	},
	baseUrl: 'branch',
	sectionProperty: 'dataForms',
	propertyName: 'branches',
	entityTitleProperty: "companyName",
	label: "Branches of the company"
});

BusinessProcessNew.prototype.dataForms.map.branches.entities.add(
	new TabularEntity({
		propertyName: 'companyName'
	})
);
BusinessProcessNew.prototype.dataForms.map.branches.entities.add(
	new TabularEntity({
		propertyName: 'responsiblePerson/firstName'
	})
);
BusinessProcessNew.prototype.dataForms.map.branches.entities.add(
	new TabularEntity({
		propertyName: 'responsiblePerson/lastName'
	})
);
BusinessProcessNew.prototype.dataForms.map.branches.entities.add(
	new TabularEntity({
		propertyName: 'isFranchise'
	})
);
