'use strict';

var register = require('./_register');

exports.banner = function () {
	div({ class: 'public-multi-entry' },
		h1("Lorem ipsum dolor sit amet"),
		div(
			div(
				{ class: 'single-entry' },
				a({ onclick: register.show  }, "Single trader")
			),
			div(
				{ class: 'single-entry' },
				a({ onclick: register.show  }, "Partnership")
			)
		)
		);
};
