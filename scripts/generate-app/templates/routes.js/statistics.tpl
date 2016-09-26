// Routes for the views.

'use strict';

require('../../view/base');

module.exports = require('eregistrations/routes/statistics')(
	require('../../apps-common/processing-steps/meta')
);
