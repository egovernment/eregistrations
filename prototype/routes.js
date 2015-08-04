// Configuration of URL routes for a prototype website

'use strict';

module.exports = {
	// Public routes
	'/': require('./view/index'),
	'reset-password': require('./view/reset-password'),

	// Part-A routes
	guide: require('./view/guide'),
	'guide-lomas': require('./view/guide-lomas-form'),
	'guide-lomas/form-complement': require('./view/guide-lomas-form-complement'),
	'guide/costs-print': require('./view/print-user-costs'),
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

	// Part-B routes - user submitted
	'user-submitted': require('./view/user-submitted'),
	'user-submitted/(document)': {
		match: function () {
			this.document = this.businessProcess.requirementUploads.applicable.first.document;
			return true;
		},
		view: require('./view/document')
	},
	'print-request-history': require('./view/print-user-history'),
	'user-submitted/data-print': require('./view/print-user-data'),
	'user-submitted/print-user-data-alternative': require('./view/print-user-data-alternative'),

	// Part-B routes - users admin
	'users-admin': require('./view/users-admin'),
	'users-admin/add-user': require('./view/add-user'),
	'users-admin/edit-user-id': require('./view/edit-user'),
	'users-admin/user-id': require('./view/users-admin-user'),

	// Part-B routes - official user
	official: require('./view/official'),
	'revision/user-id': require('./view/revision'),
	'official/user-id': require('./view/official-form'),
	'official/user-id/certificates': require('./view/_certificates-form'),
	'official/user-id/document': require('./view/official-document'),
	'official/users-list/print': require('./view/print-users-list'),

	// Part-B routes - front-desk
	'front-desk/user-id': require('./view/_front-desk'),

	// Part-B routes - statistics
	statistics: require('./view/statistics'),
	'filtered-statistics': require('./view/filtered-statistics'),

	// Part-B routes - translations
	i18n: require('./view/translations-panel')

};
