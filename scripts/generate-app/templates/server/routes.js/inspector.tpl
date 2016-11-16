// Server-only GET router

'use strict';

module.exports = require('eregistrations/server/routes/inspector')({
    driver: require('mano').dbDriver,
    processingStepsMeta: require('../../../apps-common/processing-steps')
});
