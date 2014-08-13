'use strict';

exports['user-name'] = function () {
	text("Users Official");
};

exports['submitted-menu'] = function () {
	nav(
		{ class: 'items' },
		menuitem(
			a({ class: 'item-active' },
				"Revision")
		),
		menuitem(
			a({ href: '/profile/' }, "Profile")
		)
	);
	nav(
		menuitem(a("test"))
	);
};

exports['sub-main'] = function () {
	div("test");
};
