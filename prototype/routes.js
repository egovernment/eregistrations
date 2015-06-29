// Configuration of URL routes for a prototype website

'use strict';

module.exports = {
	'/': require('./view/index'),
	public: require('./view/public'),
	'reset-password': require('./view/reset-password'),
	'multi-entry': require('./view/multi-entry'),
	guide: require('./view/guide'),
	'guide-lomas': require('./view/guide-lomas-form'),
	'guide-lomas/form-complement': require('./view/guide-lomas-form-complement'),
	'guide/costs-print': require('./view/print-user-costs'),
	forms: require('./view/forms'),
	'forms/disabled': require('./view/disabled-forms'),
	documents: require('./view/documents'),
	'documents/disabled': require('./view/disabled-documents'),
	submission: require('./view/submission'),
	profile: require('./view/user-profile'),
	'partner-add': require('./view/partner-add'),
	'forms/partner-id': require('./view/partner')

};
