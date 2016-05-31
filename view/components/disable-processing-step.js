'use strict';

var _  = require('mano').i18n.bind('View: Component: Official');

module.exports = function (step, container) {
	return [_if(not(step._isPending), div({ class: 'entities-overview-info' },
		_("Below form was already processed, and cannot be re-submitted at this point."))),
		div({ class: ['disabler-range',
			_if(not(step._isPending), 'disabler-active')] }, container, div({ class: 'disabler' }))];
};
