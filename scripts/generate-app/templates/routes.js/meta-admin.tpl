// Routes for the views.

'use strict';

require('../../view/user-base');

module.exports = {
	'/': require('../../view/meta-admin/translations-panel'),
	profile: require('eregistrations/view/user-profile')
};
