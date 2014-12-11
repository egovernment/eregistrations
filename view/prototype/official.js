'use strict';

exports['user-name'] = function () {
	text("Official");
};

exports['submitted-menu'] = function () {
	nav(
		ul(
			{ class: 'items' },
			li(
				a({ class: 'item-active' },
					"Official")
			),
			li(
				a({ href: '/profile/' }, "Profile")
			)
		)
	);
	nav(
		ul(
			{ class: 'items' },
			li(
				form(
					{ class: 'role-select' },
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
				{ class: 'print-button', href: '/official/users-list/print/' },
				span({ class: 'fa fa-print' }),
				"Print list"
			)
		)
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
						{ class: 'user-basic-data' },
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
						{ class: 'user-basic-data' },
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
						{ class: 'user-basic-data' },
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
						{ class: 'user-basic-data' },
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
						{ class: 'user-basic-data' },
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
						{ class: 'user-basic-data' },
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
						{ class: 'user-basic-data' },
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
						{ class: 'user-basic-data' },
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
						{ class: 'user-basic-data' },
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

};
