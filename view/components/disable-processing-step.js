'use strict';

var _                = require('mano').i18n.bind('View: Component: Official')
  , normalizeOptions = require('es5-ext/object/normalize-options');

module.exports = function (step, container/*, options */) {
	var options = normalizeOptions(arguments[2]);
	return [_if(not(step._isPending), div({ class: 'entities-overview-info' },
		options.customMessage ||
			_("Below form was already processed, and cannot be re-submitted at this point."))),
		div({ class: ['disabler-range',
			_if(not(step._isPending), 'disabler-active')] }, container, div({ class: 'disabler' }))];
};
