// Routes for the ${appName} application.

'use strict';

module.exports = {
	'/': require('../../view/${appNameHyphen}'),
	profile: require('eregistrations/view/${appName}')
};
