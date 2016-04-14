'use strict';

var normalizeOptions = require('es5-ext/object/normalize-options');

module.exports = function (container, disableCondition/*, options*/) {
	var options     = normalizeOptions(arguments[2])
	  , forcedState = options.forcedState
	  , disablerId  = options.id;

	disableCondition = forcedState == null ? disableCondition : forcedState;

	return div({ class: ['disabler-range', _if(disableCondition, 'disabler-active')],
		id: disablerId }, div({ class: 'disabler' }), container);
};
