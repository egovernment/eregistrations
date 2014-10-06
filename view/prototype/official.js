'use strict';

exports['user-name'] = function () {
	text("Official");
};

exports['submitted-menu'] = function () {
	nav(
		{ class: 'items' },
		menuitem(
			a({ class: 'item-active' },
				"Official")
		),
		menuitem(
			a({ href: '/profile/' }, "Profile")
		)
	);
	nav(
		{ class: 'items' },
		menuitem(
			select({ class: 'role-select' },
					option("Role"),
					option("Official user"),
					option("Admin user"),
					option("User")
				)
		)
	);
};

exports['sub-main'] = function () {
	div(
		{ class: 'section-primary users-table-filter-bar' },
		form(
			div(
				label(
					"Status: "
				),
				select(
					option("Pending for revision"),
					option("Revisioned"),
					option("Todo")
				)
			),
			div(
				label(
					"Search: "
				),
				span({ class: 'input-append' },
						input({ type: 'search' }),
						button({ class: 'add-on' },
							span({ class: 'fa fa-search' })
							)
					)
			)
		),
		div(
			a({ class: 'print-button' }, "Print files list")
		)
	);
	table(
		{ class: 'submitted-user-data-table' },
		thead(
			tr(
				th("User"),
				th("Application number"),
				th({ class: 'desktop-only' }, "Date of registration"),
				th("Requested registration"),
				th("Actions")
			)
		),
		tbody(
			tr(
				td(
					{ class: 'user-basic-data' },
					a({ href: '/official/user-id/' }, "John Watson",
						span('johnwatson@gmail.com')
						)
				),
				td(
					a({ href: '/official/user-id/' }, "4068-50001-N-2013")
				),
				td(
					{ class: 'desktop-only' },
					a({ href: '/official/user-id/' }, "23/07/2014 18:09:22")
				),
				td(
					a({ href: '/official/user-id/' }, "Investment")
				),
				td(
					{ class: 'actions' },
					a("Download")
				)
			),
			tr(
				td(
					{ class: 'user-basic-data' },
					a({ href: '/official/user-id/' }, "John Watson",
						span('johnwatson@gmail.com')
						)
				),
				td(
					a({ href: '/official/user-id/' }, "4068-50001-N-2013")
				),
				td(
					{ class: 'desktop-only' },
					a({ href: '/official/user-id/' }, "23/07/2014 18:09:22")
				),
				td(
					a({ href: '/official/user-id/' }, "Investment")
				),
				td(
					{ class: 'actions' },
					a("Download")
				)
			),
			tr(
				td(
					{ class: 'user-basic-data' },
					a({ href: '/official/user-id/' }, "John Watson",
						span('johnwatson@gmail.com')
						)
				),
				td(
					a({ href: '/official/user-id/' }, "4068-50001-N-2013")
				),
				td(
					{ class: 'desktop-only' },
					a({ href: '/official/user-id/' }, "23/07/2014 18:09:22")
				),
				td(
					a({ href: '/official/user-id/' }, "Investment")
				),
				td(
					{ class: 'actions' },
					a("Download")
				)
			),
			tr(
				td(
					{ class: 'user-basic-data' },
					a({ href: '/official/user-id/' }, "John Watson",
						span('johnwatson@gmail.com')
						)
				),
				td(
					a({ href: '/official/user-id/' }, "4068-50001-N-2013")
				),
				td(
					{ class: 'desktop-only' },
					a({ href: '/official/user-id/' }, "23/07/2014 18:09:22")
				),
				td(
					a({ href: '/official/user-id/' }, "Investment")
				),
				td(
					{ class: 'actions' },
					a("Download")
				)
			),
			tr(
				td(
					{ class: 'user-basic-data' },
					a({ href: '/official/user-id/' }, "John Watson",
						span('johnwatson@gmail.com')
						)
				),
				td(
					a({ href: '/official/user-id/' }, "4068-50001-N-2013")
				),
				td(
					{ class: 'desktop-only' },
					a({ href: '/official/user-id/' }, "23/07/2014 18:09:22")
				),
				td(
					a({ href: '/official/user-id/' }, "Investment")
				),
				td(
					{ class: 'actions' },
					a("Download")
				)
			),
			tr(
				td(
					{ class: 'user-basic-data' },
					a({ href: '/official/user-id/' }, "John Watson",
						span('johnwatson@gmail.com')
						)
				),
				td(
					a({ href: '/official/user-id/' }, "4068-50001-N-2013")
				),
				td(
					{ class: 'desktop-only' },
					a({ href: '/official/user-id/' }, "23/07/2014 18:09:22")
				),
				td(
					a({ href: '/official/user-id/' }, "Investment")
				),
				td(
					{ class: 'actions' },
					a("Download")
				)
			),
			tr(
				td(
					{ class: 'user-basic-data' },
					a({ href: '/official/user-id/' }, "John Watson",
						span('johnwatson@gmail.com')
						)
				),
				td(
					a({ href: '/official/user-id/' }, "4068-50001-N-2013")
				),
				td(
					{ class: 'desktop-only' },
					a({ href: '/official/user-id/' }, "23/07/2014 18:09:22")
				),
				td(
					a({ href: '/official/user-id/' }, "Investment")
				),
				td(
					{ class: 'actions' },
					a("Download")
				)
			),
			tr(
				td(
					{ class: 'user-basic-data' },
					a({ href: '/official/user-id/' }, "John Watson",
						span('johnwatson@gmail.com')
						)
				),
				td(
					a({ href: '/official/user-id/' }, "4068-50001-N-2013")
				),
				td(
					{ class: 'desktop-only' },
					a({ href: '/official/user-id/' }, "23/07/2014 18:09:22")
				),
				td(
					a({ href: '/official/user-id/' }, "Investment")
				),
				td(
					{ class: 'actions' },
					a("Download")
				)
			),
			tr(
				td(
					{ class: 'user-basic-data' },
					a({ href: '/official/user-id/' }, "John Watson",
						span('johnwatson@gmail.com')
						)
				),
				td(
					a({ href: '/official/user-id/' }, "4068-50001-N-2013")
				),
				td(
					{ class: 'desktop-only' },
					a({ href: '/official/user-id/' }, "23/07/2014 18:09:22")
				),
				td(
					a({ href: '/official/user-id/' }, "Investment")
				),
				td(
					{ class: 'actions' },
					a("Download")
				)
			)
		)
	);

};
