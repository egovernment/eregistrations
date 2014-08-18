'use strict';

exports['user-name'] = function () {
	text("Users Official");
};

exports['submitted-menu'] = function () {
	div(
		{ class: 'navs-both-sides' },
		nav(
			{ class: 'items' },
			menuitem(
				a({ class: 'item-active' },
					"Revision")
			),
			menuitem(
				a({ href: '/profile/' }, "Profile")
			)
		),
		nav(
			{ class: 'items' },
			menuitem(
				select({ class: 'role-select' },
						option("Official user"),
						option("Admin user"),
						option("User")
					)
			)
		)
	);
};

exports['sub-main'] = function () {
	section(
		{ class: 'section-primary' },
		div(
			{ class: 'user-official-tools' },
			form(
				{ class: 'dbjs-input-component' },
				label(
					"Status: "
				),
				div(
					{ class: "controle" },
					select(
						option("Pending for revision"),
						option("Revisioned"),
						option("Todo")
					)
				)
			),
			form(
				{ class: 'dbjs-input-component' },
				label(
					"Status: "
				),
				div(
					{ class: "controle" },
					span({ class: 'input-append' },
							input({ type: 'text' }),
							button({ class: 'add-on' },
								span({ class: 'fa fa-search' })
								)
						)
				)
			),
			div(
				a({ class: 'print-button' }, "Print files list")
			)
		)
	);
};
