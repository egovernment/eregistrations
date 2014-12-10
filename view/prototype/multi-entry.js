'use strict';

exports.banner = function () {
	div({ class: 'public-multi-entry content' },
		h1("Lorem ipsum dolor sit amet"),
		div(
			div(
				{ class: 'single-entry' },
				a(
					{ href: '#register' },
					span({ class: "single-entry-hint hint-optional hint-optional-left",
						"data-hint": "Hint displayed here." }),
					p("Single Trader"),
					p({ class: "public-multi-entry-action" }, "Account creation")
				)
			),
			div(
				{ class: 'single-entry' },
				a(
					{ href: '#register'  },
					span({ class: "single-entry-hint hint-optional hint-optional-left",
						"data-hint": "Hint displayed here." }),
					p("Partnership"),
					p({ class: "public-multi-entry-action" }, "Account creation")
				)
			)
		)
		);
};
