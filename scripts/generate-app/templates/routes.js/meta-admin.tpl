// Routes for the views.

'use strict';

require('../../view/base');
require('../../view/meta-admin/meta-admin-base');

module.exports = {
	'/': require('../../view/meta-admin/translations-panel'),
	profile: require('eregistrations/view/user-profile')
};
