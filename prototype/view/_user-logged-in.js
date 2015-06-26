'use strict';

exports._parent = require('./_main');

exports.menu = function () {
	li(
		a(
			{ href: '/profile/' },
			span({ class: 'fa fa-user' }, "Preferences")
		)
	);
	li(
		a(
			{ href: '/profile/' },
			span({ class: 'header-top-user-name', id: 'user-name' })
		)
	);
	li(
		a(
			{ href: '/profile/' },
			span({ class: 'fa fa-cogs' }, "Preferences")
		)
	);
	li(
		a({ href: '/' },
			span({ class: 'fa fa-power-off' }, "Log out")
			)
	);
};
