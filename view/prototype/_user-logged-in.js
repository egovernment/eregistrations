'use strict';

exports.menu = function () {
	menuitem(
		a(
			{ href: '/profile/' },
			span({ class: 'fa fa-user' }, "Preferences")
		)
	);
	menuitem(
		a(
			{ href: '/profile/' },
			span({ class: 'user-name', id: 'user-name' })
		)
	);
	menuitem(
		a(
			{ href: '/profile/' },
			span({ class: 'fa fa-cogs' }, "Preferences")
		)
	);
	menuitem(
		a({ href: '/' },
			span({ class: 'fa fa-power-off' }, "Log out")
			)
	);
};
