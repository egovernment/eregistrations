'use strict';

exports['user-name'] = function () {
	text("Users Admin");
};

exports['submitted-menu'] = function () {
	menuitem(
		a({ class: 'item-active', href: '/users-admin/' },
			"Application")
	);
	menuitem(
		a({ href: '/profile/' }, "Profile")
	);
};

exports['sub-main'] = function () {
	section(
		{ class: 'submitted-main' },
		div(
			a({ class: 'button-main ', href: '/users-admin/add-user/' }, "New User")
		),
		table(
			{ 'class': 'official-users-table' },
			thead(
				tr(
					th("Email"),
					th("Institution"),
					th({ 'class': 'desktop-only' }, "Creation date"),
					th({ class: 'actions' }, "Actions")
				)
			),
			tbody(
				tr(
					td(
						div(a({ href: '/users-admin/user-id/' }, "john.watson@sherloc.com"))
					),
					td(
						div("Bussines Licence A")
					),
					td(
						{ 'class': 'desktop-only' },
						div("23/07/2014 18:09:22")
					),
					td(
						{ class: 'actions' },
						a({ href: '/users-admin/edit-user-id/' }, "Edit"),
						a("Delete")
					)
				),
				tr(
					td(
						div(a({ href: '/users-admin/user-id/' }, "john.watson@sherloc.com"))
					),
					td(
						div("Bussines Licence A")
					),
					td(
						{ 'class': 'desktop-only' },
						div("23/07/2014 18:09:22")
					),
					td(
						{ class: 'actions' },
						a({ href: '/users-admin/edit-user-id/' }, "Edit"),
						a("Delete")
					)
				),
				tr(
					td(
						div(a({ href: '/users-admin/user-id/' }, "john.watson@sherloc.com"))
					),
					td(
						div("Bussines Licence A")
					),
					td(
						{ 'class': 'desktop-only' },
						div("23/07/2014 18:09:22")
					),
					td(
						{ class: 'actions' },
						a({ href: '/users-admin/edit-user-id/' }, "Edit"),
						a("Delete")
					)
				),
				tr(
					td(
						div(a({ href: '/users-admin/user-id/' }, "john.watson@sherloc.com"))
					),
					td(
						ul(
							li("Bussines Licence A"),
							li("Bussines Licence A"),
							li("Bussines Licence A"),
							li("Bussines Licence A")
						)
					),
					td(
						{ 'class': 'desktop-only' },
						div("23/07/2014 18:09:22")
					),
					td(
						{ class: 'actions' },
						a({ href: '/users-admin/edit-user-id/' }, "Edit"),
						a("Delete")
					)
				),
				tr(
					td(
						div(a({ href: '/users-admin/user-id/' }, "john.watson@sherloc.com"))
					),
					td(
						div("Bussines Licence A")
					),
					td(
						{ 'class': 'desktop-only' },
						div("23/07/2014 18:09:22")
					),
					td(
						{ class: 'actions' },
						a({ href: '/users-admin/edit-user-id/' }, "Edit"),
						a("Delete")
					)
				),
				tr(
					td(
						div(a({ href: '/users-admin/user-id/' }, "john.watson@sherloc.com"))
					),
					td(
						div("Bussines Licence A")
					),
					td(
						{ 'class': 'desktop-only' },
						div("23/07/2014 18:09:22")
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
