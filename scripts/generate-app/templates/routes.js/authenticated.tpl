// Routes for the views.

'use strict';

var includeProfileController = require('eregistrations/routes/utils/include-profile-controller');

module.exports = exports = {
	'/': require('../../view/user-base')
};

includeProfileController(exports);
