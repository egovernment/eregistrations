// Routes for the views.

'use strict';

require('../../view/user-base');

module.exports = {
	'/': require('eregistrations/view/manager-business-processes'),
    clients: require('eregistrations/view/manager-home'),
	profile: require('eregistrations/view/user-profile'),
	'new-client': require('eregistrations/view/manager-user-create')
};
