'use strict';

exports['user-name'] = function () {
	text("Users Admin");
};

exports['submitted-menu'] = function () {
	nav(
		ul(
			{ class: 'items' },
			li(
				a({ class: 'item-active', href: '/users-admin/' },
					"Application")
			),
			li(
				a({ href: '/profile/' }, "Profile")
			)
		)
	);
};

exports['sub-main'] = function () {
	section(
		{ class: 'submitted-main' },
		div(
			{ class: 'submitted-add-user' },
			a({ class: 'button-main ', href: '/users-admin/add-user/' }, "New User")
		),
		table(
			{ class: 'submitted-user-data-table' },
			thead(
				tr(
					th("User"),
					th("Institution"),
					th({ class: 'desktop-only' }, "Creation date"),
					th("Actions")
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
				),
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
				),
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
				),
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
				),
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
				),
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
