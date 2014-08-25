'use strict';

exports.banner = function () {
	div({ class: 'multi-entry' },
		h1("Lorem ipsum dolor sit amet"),
		div(
			a("Individual traders"),
			a("Partnership")
		)
		);
};
