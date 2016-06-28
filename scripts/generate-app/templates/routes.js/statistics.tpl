// Routes for the views.

'use strict';

require('../../view/user-base');

module.exports = require('eregistrations/routes/statistics')(
	require('../../apps-common/processing-steps/meta')
);
