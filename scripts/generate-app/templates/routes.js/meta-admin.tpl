// Routes for the views.

'use strict';

var includeProfileController = require('eregistrations/routes/utils/include-profile-controller');

require('../../view/user-base');

module.exports = exports = {
	'/': require('../../view/meta-admin/translations-panel')
};

includeProfileController(exports);
