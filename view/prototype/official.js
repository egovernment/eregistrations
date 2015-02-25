'use strict';

exports['user-name'] = function () {
	text("Official");
};

exports['submitted-menu'] = function () {
	nav(
		ul(
			{ class: 'submitted-menu-items' },
			li(
				a({ class: 'submitted-menu-item-active' },
					"Official")
			),
			li(
				a({ href: '/profile/' }, "Profile")
			)
		)
	);
	nav(
		ul(
			{ class: 'submitted-menu-items' },
			li(
				form(
					{ class: 'submitted-menu-role-select' },
					p(
						select(
							option("Role"),
							option("Official user"),
							option("Admin user"),
							option("User")
						)
					)
				)
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
						span({ class: 'add-on' },
							span({ class: 'fa fa-search' })
							)
					)
			),
			div(
				input({ type: 'submit' }, "Submit")
			)
		),
		div(
			a(
				{ class: 'users-table-filter-bar-print', href: '/official/users-list/print/' },
				span({ class: 'fa fa-print' }),
				"Print list"
			)
		)
	);

	ul(
		{ class: 'pagination' },
		li(a("<<")),
		li(a("<")),
		li(a({ class: 'pagination-active' }, "1")),
		li(a("2")),
		li(a("3")),
		li(a("4")),
		li(a("5")),
		li(a("6")),
		li(a("7")),
		li(a("8")),
		li(a("9")),
		li(a("10")),
		li(a("11")),
		li(a("12")),
		li(a("13")),
		li(a("14")),
		li(a("15")),
		li(a("16")),
		li(a(">")),
		li(a(">>"))
	);

	div(
		{ class: 'table-responsive-container' },
		table(
			{ class: 'submitted-user-data-table' },
			thead(
				tr(
					th("User"),
					th({ class: 'desktop-only' }, "Application number"),
					th({ class: 'desktop-only' }, "Date of registration"),
					th("Requested registration"),
					th({ class: 'actions' }, "Actions")
				)
			),
			tbody(
				tr(
					td(
						{ class: 'submitted-user-data-table-basic' },
						a({ href: '/official/user-id/' }, "John Watson",
							span('johnwatson@gmail.com')
							)
					),
					td(
						{ class: 'desktop-only' },
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
						a(span({ class: 'fa fa-download' }, "Download"))
					)
				),
				tr(
					td(
						{ class: 'submitted-user-data-table-basic' },
						a({ href: '/official/user-id/' }, "John Watson",
							span('johnwatson@gmail.com')
							)
					),
					td(
						{ class: 'desktop-only' },
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
						a(span({ class: 'fa fa-download' }, "Download"))
					)
				),
				tr(
					td(
						{ class: 'submitted-user-data-table-basic' },
						a({ href: '/official/user-id/' }, "John Watson",
							span('johnwatson@gmail.com')
							)
					),
					td(
						{ class: 'desktop-only' },
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
						a(span({ class: 'fa fa-download' }, "Download"))
					)
				),
				tr(
					td(
						{ class: 'submitted-user-data-table-basic' },
						a({ href: '/official/user-id/' }, "John Watson",
							span('johnwatson@gmail.com')
							)
					),
					td(
						{ class: 'desktop-only' },
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
						a(span({ class: 'fa fa-download' }, "Download"))
					)
				),
				tr(
					td(
						{ class: 'submitted-user-data-table-basic' },
						a({ href: '/official/user-id/' }, "John Watson",
							span('johnwatson@gmail.com')
							)
					),
					td(
						{ class: 'desktop-only' },
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
						a(span({ class: 'fa fa-download' }, "Download"))
					)
				),
				tr(
					td(
						{ class: 'submitted-user-data-table-basic' },
						a({ href: '/official/user-id/' }, "John Watson",
							span('johnwatson@gmail.com')
							)
					),
					td(
						{ class: 'desktop-only' },
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
						a(span({ class: 'fa fa-download' }, "Download"))
					)
				),
				tr(
					td(
						{ class: 'submitted-user-data-table-basic' },
						a({ href: '/official/user-id/' }, "John Watson",
							span('johnwatson@gmail.com')
							)
					),
					td(
						{ class: 'desktop-only' },
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
						a(span({ class: 'fa fa-download' }, "Download"))
					)
				),
				tr(
					td(
						{ class: 'submitted-user-data-table-basic' },
						a({ href: '/official/user-id/' }, "John Watson",
							span('johnwatson@gmail.com')
							)
					),
					td(
						{ class: 'desktop-only' },
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
						a(span({ class: 'fa fa-download' }, "Download"))
					)
				),
				tr(
					td(
						{ class: 'submitted-user-data-table-basic' },
						a({ href: '/official/user-id/' }, "John Watson",
							span('johnwatson@gmail.com')
							)
					),
					td(
						{ class: 'desktop-only' },
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
						a(span({ class: 'fa fa-download' }, "Download"))
					)
				)
			)
		)
	);

	ul(
		{ class: 'pagination' },
		li(a("<<")),
		li(a("<")),
		li(a({ class: 'pagination-active' }, "1")),
		li(a("2")),
		li(a("3")),
		li(a("4")),
		li(a("5")),
		li(a("6")),
		li(a("7")),
		li(a("8")),
		li(a("9")),
		li(a("10")),
		li(a("11")),
		li(a("12")),
		li(a("13")),
		li(a("14")),
		li(a("15")),
		li(a("16")),
		li(a(">")),
		li(a(">>"))
	);

};
