// Routes for the views.

'use strict';

require('../../view/base');

module.exports = {
	'/': require('eregistrations/view/inspector'),
	profile: require('eregistrations/view/user-profile')
};
