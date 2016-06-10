// Routes for the views.

'use strict';

module.exports = {
	'/': require('../view/business-process-guide'),
	forms: require('../view/business-process-data-forms'),
	profile: {
		view: require('../view/user-profile'),
		decorateContext: function () {
			if (this.manager) {
				this.user = this.manager;
			}
		}
	},
	'managed-user-profile': require('../view/managed-user-profile'),
	documents: require('../view/business-process-documents'),
	pay: require('../view/business-process-payment'),
	submission: require('../view/business-process-submission-forms'),
	'costs-print': require('../view/print-business-process-costs-list')
};
