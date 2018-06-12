// Routes for the views.

'use strict';

var includeProfileController = require('eregistrations/routes/utils/include-profile-controller');

require('../../view/components/table-columns');
require('../../view/user-base');

module.exports = exports = {
	'/': require('eregistrations/view/manager-business-processes'),
	clients: require('eregistrations/view/manager-home'),
	'new-client': require('eregistrations/view/manager-user-create')
};

includeProfileController(exports);
