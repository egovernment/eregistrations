'use strict';

module.exports = function (input, options) {
	return div(
		{ class: 'dbjs-input-component' },
		label(options.label),
		div({ class: 'input' }, input.observable)
	);
};
