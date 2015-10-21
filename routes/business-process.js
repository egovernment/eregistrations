// Routes for the views.

'use strict';

module.exports = {
	'/': require('eregistrations/view/business-process-guide'),
	forms: require('eregistrations/view/business-process-data-forms'),
	profile: require('eregistrations/view/user-profile'),
	documents: require('eregistrations/view/business-process-documents'),
	pay: require('eregistrations/view/business-process-payment'),
	submission: require('eregistrations/view/business-process-submission-forms'),
	'costs-print': require('eregistrations/view/print-business-process-costs-list'),
	'print-forms-data': require('eregistrations/view/print-business-process-data')
};
