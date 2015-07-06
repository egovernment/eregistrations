'use strict';

exports._parent = require('./base');

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
			span({ class: 'header-top-user-name' }, this.user._fullName)
		)
	);
	li(
		a(
			{ href: '/profile/' },
			span({ class: 'fa fa-cogs' }, "Preferences")
		)
	);
	li(
		a({ href: '/logout/', rel: 'server' },
			span({ class: 'fa fa-power-off' }, "Log out")
			)
	);
};

exports.main = function () {
	div({ class: 'submitted-menu' },
			div({ class: 'submitted-menu-bar content' },
				nav(ul({ class: 'submitted-menu-items', id: 'submitted-menu' },
					exports._submittedMenu(this)))));
	div({ class: 'user-forms', id: 'sub-main' });
};

exports._submittedMenu = Function.prototype;
