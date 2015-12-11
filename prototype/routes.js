// Configuration of URL routes for a prototype website

'use strict';

// Assure prototype specific print base customisations
require('./view/print-base');
require('./view/user');

module.exports = {
	// Public routes
	'/': require('./view/index'),
	'reset-password': require('./view/reset-password'),

	// Part-A routes
	guide: require('./view/guide'),
	'guide-lomas': require('./view/guide-lomas-form'),
	'guide-lomas/form-complement': require('./view/guide-lomas-form-complement'),
	'guide/costs-print': require('../view/print-business-process-costs-list'),
	forms: require('./view/forms'),
	'forms/disabled': require('./view/disabled-forms'),
	documents: require('./view/documents'),
	pay: require('./view/payment'),
	'documents/disabled': require('./view/disabled-documents'),
	submission: require('./view/submission'),
	profile: require('./view/user-profile'),
	'nested-entity/(example)': {
		match: function (entity) {
			this.entity = this.businessProcess.branches.map.get(entity);
			return true;
		},
		view: require('./view/add-edit-entity')
	},
	'partner-add': require('./view/partner-add'),
	'forms/partner-id': require('./view/partner'),

	// My-account
	'my-account': require('../view/user-home'),
	'my-account/data': require('./view/user-business-process-data'),
	'my-account/print': require('../view/print-business-process-chain-data'),
	'my-account/documents': require('./view/user-business-process-documents-list'),
	'my-account/requests': require('../view/user-requests'),
	'my-account/summary': require('../view/user-business-process-summary'),

	// Part-B routes - user submitted
	'user-submitted': require('./view/user-submitted'),
	'user-submitted/(document)': {
		match: function () {
			this.document = this.businessProcess.requirementUploads.applicable.first.document;
			return true;
		},
		view: require('./view/document')
	},
	'print-request-history': require('../view/print-business-process-status-log'),
	'data-print': require('./view/print-user-data'),
	'user-submitted/print-user-data-alternative': require('./view/print-user-data-alternative'),
	'print-business-processes-data': require('../view/print-business-process-data'),

	// Part-B routes - users admin
	'users-admin': require('../view/users-table'),
	'users-admin/add-user': require('../view/user-create'),
	'users-admin/(edit-user-id)': {
		match: function () {
			this.editedUser = this.user.database.userVianney;
			return true;
		},
		view: require('../view/user-edit')
	},

	// Part-B routes - official user
	official: require('./view/business-processes-table'),
	'revision/user-id': require('./view/business-process-revision'),
	'revision/user-id/(document)': {
		match: function () {
			this.document = this.businessProcess.requirementUploads.applicable.first.document;
			return true;
		},
		view: require('./view/business-process-revision-document')
	},
	'revision/user-id/(payment)': {
		match: function () {
			this.document = this.businessProcess.paymentReceiptUploads.applicable.first.document;
			return true;
		},
		view: require('./view/business-process-revision-payment')
	},
	'official/user-id/(document)': {
		match: function () {
			this.document = this.businessProcess.requirementUploads.applicable.first.document;
			return true;
		},
		view: require('../view/business-process-document')
	},
	firstBusinessProcess: {
		match: function () { return true; },
		view: require('./view/business-process-official-form')
	},
	'official/user-id/certificates': require('./view/_certificates-form'),
	'firstBusinessProcess/documents-and-data': {
		match: function () {
			this.document = this.businessProcess.requirementUploads.applicable.first.document;
			return true;
		},
		view: require('../view/business-process-official-data')
	},
	'print-business-processes-list': require('./view/print-business-processes-table'),

	// Part-B routes - front-desk
	'front-desk/user-id': require('./view/_front-desk'),

	// Part-B routes - statistics
	statistics: require('./view/statistics'),
	'filtered-statistics': require('./view/filtered-statistics'),

	// Part-B routes - translations
	i18n: require('./view/translations-panel')

};
