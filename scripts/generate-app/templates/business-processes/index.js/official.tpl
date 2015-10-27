// Collection of all business processes applicable for this app

'use strict';

module.exports = require('eregistrations/business-processes/submitted')
	.filterByKeyPath('processingSteps/map/${ appNameSuffix }/isReady', true);
