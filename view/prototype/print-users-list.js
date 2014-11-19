'use strict';

exports.body = function () {
	header(
		{ class: 'print-header' },
		img({ src: '/img/logo-2.png' }),
		div(
			h2("Revision"),
			p("19/11/2015")
		)
	);
	section(
		table(
			{ class: 'submitted-user-data-table' },
			thead(
				tr(
					th("User"),
					th("Institution"),
					th({ class: 'desktop-only' }, "Creation date"),
					th({ class: 'actions' }, "Actions")
				)
			),
			tbody(
				tr(
					td(
						{ class: 'user-basic-data' },
						a({ href: '/users-admin/user-id/' }, "John Watson",
							span('johnwatson@gmail.com')
							)
					),
					td(
						a({ href: '/users-admin/user-id/' }, "Bussines Licence A")
					),
					td(
						{ class: 'desktop-only' },
						a({ href: '/users-admin/user-id/' }, "23/07/2014 18:09:22")
					),
					td(
						{ class: 'actions' },
						a({ href: '/users-admin/edit-user-id/' }, "Edit"),
						a("Delete")
					)
				)
			)
		)
	);
};
