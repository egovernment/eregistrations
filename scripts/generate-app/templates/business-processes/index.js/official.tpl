// Collection of all business processes applicable for this app

'use strict';

var isFalsy = require('eregistrations/utils/is-falsy');

module.exports = require('mano').db.BusinessProcess.instances.filterByKey('isDemo',
	isFalsy).filterByKeyPath('processingSteps/map/${ appNameSuffix }/isReady', true);
