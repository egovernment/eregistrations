'use strict';

var _                 = require('../../../i18n').bind('User')
  , businessProcesses = require('../../../apps-common/business-processes/${ appNamePostfix }');

module.exports = [{
	preTrigger: businessProcesses.filterByKey('guideProgress', 1),
	trigger: businessProcesses.filterByKey('isSubmitted', true),
	label: _('Request'),
	text: _('Request received')
}];
