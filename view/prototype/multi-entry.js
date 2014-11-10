'use strict';

var register = require('./_register');

exports.banner = function () {
	div({ class: 'public-multi-entry content' },
		h1("Lorem ipsum dolor sit amet"),
		div(
			div(
				{ class: 'single-entry' },
				a(
					{ onclick: register.show  },
					span({ class: "single-entry-hint hint-optional hint-optional-left",
						"data-hint": "Hint displayed here." }),
					p("Single Trader"),
					p(("Account Creation"))
				)
			),
			div(
				{ class: 'single-entry' },
				a(
					{ onclick: register.show  },
					span({ class: "single-entry-hint hint-optional hint-optional-left",
						"data-hint": "Hint displayed here." }),
					p("Partnership"),
					p({ class: "btn" }, ("account creation"))
				)
			)
		)
		);
};
