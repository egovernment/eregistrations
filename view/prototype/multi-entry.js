'use strict';

exports.banner = function () {
	div({ class: 'public-multi-entry content' },
		h1("Lorem ipsum dolor sit amet"),
		div(
			div(
				{ class: 'public-multi-entry-single-entry' },
				a(
					{ href: '#register' },
					span({ class: "public-multi-entry-single-entry-hint hint-optional hint-optional-left",
						"data-hint": "Hint displayed here." }),
					p("Single Trader"),
					p({ class: "public-multi-entry-action" }, "Account creation")
				)
			),
			div(
				{ class: 'public-multi-entry-single-entry' },
				a(
					{ href: '#register'  },
					span({ class: "public-multi-entry-single-entry-hint hint-optional hint-optional-left",
						"data-hint": "Hint displayed here." }),
					p("Partnership"),
					p({ class: "public-multi-entry-action" }, "Account creation")
				)
			)
		)
		);
};
