'use strict';

var normalizeOptions = require('es5-ext/object/normalize-options');

module.exports = function (container, disableCondition/*, options*/) {
	var options         = normalizeOptions(arguments[2])
	  , forcedState     = options.forcedState
	  , disablerId      = options.id;

	return div({ class: ['disabler-range', _if(forcedState == null,
		_if(disableCondition, 'disabler-active'), _if(not(forcedState), 'disabler-active'))],
		id: disablerId }, div({ class: 'disabler' }), container);
};
