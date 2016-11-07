// Server-only GET router

'use strict';

module.exports = require('eregistrations/server/routes/inspector')({
    driver: require('mano').dbDriver,
    processingStepsMeta: require('../../../apps-common/processing-steps'),
    listProperties: require('../../../apps-common/business-process-list-properties'),
    listComputedProperties: require('../../../apps-common/business-process-list-computed-properties')
});
