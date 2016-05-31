// Configuration of URL routes for a prototype website

'use strict';

var db = require('mano').db;

// Assure prototype specific print base customisations
require('./view/print-base');
require('./view/user');
require('./view/business-process-submitted');
require('./view/business-process-official');
require('./view/business-process-revision');
require('./view/manager');
require('./view/user-business-process-documents');

module.exports = {
	// Public routes
	'/': require('./view/index'),
	'reset-password': require('./view/reset-password'),

	// User routes
	profile: require('./view/user-profile'),

	// Part A routes
	guide: require('./view/business-process-guide'),
	'guide-lomas': require('./view/business-process-guide-lomas-form'),
	'guide-lomas/form-complement': require('./view/business-process-guide-lomas-form-complement'),
	'guide/costs-print': require('../view/print-business-process-costs-list'),
	forms: require('./view/business-process-data-forms'),
	'forms/disabled': require('./view/business-process-data-forms-disabled'),
	'forms/tabbed': {
		decorateContext: function () {
			this.section = this.businessProcess.dataForms.map.company;
		},
		view: require('../view/business-process-data-forms-section-tab')
	},
	'nested-entity/(example)': {
		match: function (entity) {
			this.entity = this.businessProcess.branches.map.get(entity);
			return true;
		},
		view: require('./view/business-process-add-edit-entity')
	},
	documents: require('./view/business-process-documents'),
	'documents/disabled': require('./view/business-process-documents-disabled'),
	pay: require('./view/business-process-payment'),
	submission: require('./view/business-process-submission-forms'),

	// Business Process Submitted routes
	'business-process-submitted': {
		decorateContext: function () {
			var upload = this.businessProcess.requirementUploads.applicable.first;
			this.document = upload.document;
			this.dataSnapshot = upload.enrichJSON(upload.toJSON());
			this.documentKind = 'requirementUpload';
			this.documentUniqueKey = 'idDoc';
			this.documentUniqueId = this.businessProcess.__id__ + '/' + this.documentKind + '/document';
		},
		view: require('../view/business-process-submitted-document')
	},
	'business-process-submitted/payment-receipts/(payment)': {
		match: function () {
			var upload = this.businessProcess.paymentReceiptUploads.applicable.first;
			this.document = upload.document;
			this.dataSnapshot = upload.enrichJSON(upload.toJSON());
			this.documentKind = 'paymentReceiptUpload';
			this.documentUniqueKey = 'handlingFee';
			this.documentUniqueId = this.businessProcess.__id__ + '/' + this.documentKind + '/payment';
			return true;
		},
		view: require('../view/business-process-submitted-payment')
	},
	'business-process-submitted/certificates/(certificate)': {
		match: function () {
			this.document = this.businessProcess.certificates.uploaded.first;
			this.dataSnapshot = this.document.toJSON();
			this.documentKind = 'certificate';
			this.documentUniqueKey = 'docA';
			this.documentUniqueId = this.businessProcess.__id__ + '/' + this.documentKind +
				'/certificate';
			return true;
		},
		view: require('../view/business-process-submitted-certificate')
	},
	'business-process-submitted/data': {
		decorateContext: function () {
			this.dataSnapshot = this.businessProcess.dataForms.toJSON();
		},
		view: require('../view/business-process-submitted-data')
	},
	'print-business-process-data': require('../view/print-business-process-data'),
	'print-request-history': require('../view/print-business-process-status-log'),

	// My Account routes
	'my-account': require('../view/user-home'),
	'my-account/requests': require('../view/user-requests'),
	'my-account/summary': require('../view/user-business-process-summary'),
	'my-account/documents': {
		decorateContext: function () {
			var upload = this.businessProcess.requirementUploads.applicable.first;
			this.document = upload.document;
			this.dataSnapshot = upload.enrichJSON(upload.toJSON());
			this.documentKind = 'requirementUpload';
			this.documentUniqueKey = 'idDoc';
			this.documentUniqueId = this.businessProcess.__id__ + '/' + this.documentKind + '/document';
		},
		view: require('../view/user-business-process-document')
	},
	'my-account/certificates/(certificate)': {
		match: function () {
			this.document = this.businessProcess.certificates.uploaded.first;
			this.dataSnapshot = this.document.toJSON();
			this.documentKind = 'certificate';
			this.documentUniqueKey = 'docA';
			this.documentUniqueId = this.businessProcess.__id__ + '/' + this.documentKind +
				'/certificate';
			return true;
		},
		view: require('../view/user-business-process-certificate')
	},
	'my-account/data': require('./view/user-business-process-data'),
	'my-account/print': require('../view/print-business-process-data'),

	// Official routes
	official: require('./view/business-processes-table'),

	// Official Processing routes
	'official/business-process-id': require('./view/business-process-official-form'),
	'official/business-process-id/documents': {
		decorateContext: function () {
			var upload = this.businessProcess.requirementUploads.applicable.first;
			this.document = upload.document;
			this.dataSnapshot = upload.enrichJSON(upload.toJSON());
			this.documentKind = 'requirementUpload';
			this.documentUniqueKey = 'idDoc';
			this.documentUniqueId = this.businessProcess.__id__ + '/' + this.documentKind + '/document';
		},
		view: require('../view/business-process-official-document')
	},
	'official/business-process-id/payment-receipts/(payment)': {
		match: function () {
			var upload = this.businessProcess.paymentReceiptUploads.applicable.first;
			this.document = upload.document;
			this.dataSnapshot = upload.enrichJSON(upload.toJSON());
			this.documentKind = 'paymentReceiptUpload';
			this.documentUniqueKey = 'handlingFee';
			this.documentUniqueId = this.businessProcess.__id__ + '/' + this.documentKind + '/payment';
			return true;
		},
		view: require('../view/business-process-official-payment')
	},
	'official/business-process-id/certificates/(certificate)': {
		match: function () {
			this.document = this.businessProcess.certificates.uploaded.first;
			this.dataSnapshot = this.document.toJSON();
			this.documentKind = 'certificate';
			this.documentUniqueKey = 'docA';
			this.documentUniqueId = this.businessProcess.__id__ + '/' + this.documentKind +
				'/certificate';
			return true;
		},
		view: require('../view/business-process-official-certificate')
	},
	'official/business-process-id/data': {
		decorateContext: function () {
			this.dataSnapshot = this.businessProcess.dataForms.toJSON();
		},
		view: require('../view/business-process-official-data')
	},

	// Official Revision routes
	'revision/business-process-id': {
		decorateContext: function () {
			var upload = this.businessProcess.requirementUploads.applicable.first;
			this.document = upload.document;
			this.dataSnapshot = upload.enrichJSON(upload.toJSON());
			this.documentKind = 'requirementUpload';
			this.documentUniqueKey = 'idDoc';
			this.documentUniqueId = this.businessProcess.__id__ + '/' + this.documentKind + '/document';
			this.processingStep = this.businessProcess.processingSteps.map.revision;
		},
		view: require('../view/business-process-revision-document')
	},
	'revision/business-process-id/payment-receipts': {
		decorateContext: function () {
			var upload = this.businessProcess.paymentReceiptUploads.applicable.first;
			this.document = upload.document;
			this.dataSnapshot = upload.enrichJSON(upload.toJSON());
			this.documentKind = 'paymentReceiptUpload';
			this.documentUniqueKey = 'handlingFee';
			this.documentUniqueId = this.businessProcess.__id__ + '/' + this.documentKind + '/payment';
			this.processingStep = this.businessProcess.processingSteps.map.revision;
		},
		view: require('../view/business-process-revision-payment')
	},
	'revision/business-process-id/data': {
		decorateContext: function () {
			var dataForms = this.businessProcess.dataForms;

			this.dataSnapshot = dataForms.enrichJSON(dataForms.toJSON());
		},
		view: require('../view/business-process-revision-data')
	},
	'revision/business-process-id/processing': require('./view/business-process-revision-form'),

	// Official Front Desk routes
	'front-desk/user-id': require('./view/business-process-official-front-desk'),

	// Manager routes
	manager: {
		decorateContext: function () {
			this.user = db.notary;
		},
		view: require('../view/manager-home')
	},
	'manager/requests': {
		decorateContext: function () {
			this.user = db.notary;
		},
		view: require('../view/manager-business-processes')
	},
	'manager/requests/firstrequest': {
		decorateContext: function () {
			this.manager = db.notary;
			this.user = db.userVianney;
			this.businessProcess = db.firstBusinessProcess;
		},
		view: require('./view/business-process-guide')
	},
	'manager-validation/edit-user': {
		decorateContext: function () {
			this.editedUser = db.notary;
		},
		view: require('../view/manager-validation-user-edit')
	},

	// Admin routes
	'users-admin': require('../view/users-table'),
	'users-admin/add-user': require('../view/user-create'),
	'users-admin/(edit-user-id)': {
		match: function () {
			this.editedUser = this.user.database.userVianney;
			return true;
		},
		view: require('../view/user-edit')
	},
	statistics: require('./view/statistics'),
	'filtered-statistics': require('./view/filtered-statistics'),
	i18n: require('./view/translations-panel')
};
