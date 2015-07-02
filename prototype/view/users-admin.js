'use strict';

exports._parent = require('../../view/user-base');

exports['submitted-menu'] = function () {
	nav(
		ul(
			{ class: 'submitted-menu-items' },
			li(
				a({ class: 'submitted-menu-item-active', href: '/users-admin/' },
					"Application")
			),
			li(
				a({ href: '/profile/' }, "Profile")
			)
		)
	);
};

exports['sub-main'] = {
	class: { content: true, 'user-forms': true },
	content: function () {
		div(
			{ class: 'submitted-add-user' },
			a({ class: 'button-main ', href: '/users-admin/add-user/' }, "New User")
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
						th("Institution"),
						th({ class: 'desktop-only' }, "Creation date"),
						th({ class: 'actions' }, "Actions")
					)
				),
				tbody(
					tr(
						td(
							{ class: 'submitted-user-data-table-basic' },
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
							{ class: 'submitted-user-data-table-basic' },
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
							{ class: 'submitted-user-data-table-basic' },
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
							{ class: 'submitted-user-data-table-basic' },
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
							{ class: 'submitted-user-data-table-basic' },
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
							{ class: 'submitted-user-data-table-basic' },
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
			li(a(">")),
			li(a(">>"))
		);
	}
};
