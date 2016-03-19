'use strict';

module.exports = function (input, options) {
	return div(
		{ class: 'dbjs-input-component dbjs-input-component-read-only' },
		label(options.label),
		div({ class: 'input' }, input.observable)
	);
};
