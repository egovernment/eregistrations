// Routes for the views.

'use strict';

var includeProfileController = require('./utils/include-profile-controller');

module.exports = exports = {
	'/': require('../view/business-process-guide'),
	forms: require('../view/business-process-data-forms'),
	'managed-user-profile': require('../view/managed-user-profile'),
	documents: require('../view/business-process-documents'),
	pay: require('../view/business-process-payment'),
	submission: require('../view/business-process-submission-forms')
};

includeProfileController(exports, true);
