'use strict';

var _                    = require('mano').i18n.bind('View: Disabled Forms')
  , disableConditionally = require('./disable-conditionally');

module.exports = function (step, container) {
	return [_if(not(step._isPending), div({ class: 'entities-overview-info' },
		_("Below form was already processed, and cannot be re-submitted at this point."))),
		disableConditionally(container, not(step._isPending))];
};
