'use strict';

var _  = require('mano').i18n.bind('View: Disabled Forms');

module.exports = function (step, container) {
	return [_if(not(step._isPending), div({ class: 'entities-overview-info' },
		_("This section cannot be edited at the moment"))), div({ class: ['disabler-range',
		_if(not(step._isPending), 'disabler-active')] }, container, div({ class: 'disabler' }))];
};
