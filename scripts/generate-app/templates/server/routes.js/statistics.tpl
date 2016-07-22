// Server-only GET router

'use strict';

module.exports = require('eregistrations/server/routes/statistics')({
	db: require('../../../db'),
	driver: require('mano').dbDriver,
	processingStepsMeta: require('../../../apps-common/processing-steps')
});
