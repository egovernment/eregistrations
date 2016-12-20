// Server-only GET router

'use strict';

module.exports = require('eregistrations/server/routes/supervisor')({
	storages: require('../../../server/business-process-storages'),
	stepsMap: require('../../../apps-common/processing-steps/meta')
});
