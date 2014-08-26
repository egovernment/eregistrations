'use strict';

exports.banner = function () {
	div({ class: 'multi-entry' },
		h1("Lorem ipsum dolor sit amet"),
		div(
			div(
				{ class: 'single-entry' },
				a("Single trader")
			),
			div(
				{ class: 'single-entry' },
				a("Partnership")
			)
		)
		);
};
