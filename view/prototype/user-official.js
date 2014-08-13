'use strict';

exports['user-name'] = function () {
	text("Users Official");
};

exports['submitted-menu'] = function () {
	div(
		{ class: 'navs-both-sides' },
		nav(
			{ class: 'items' },
			menuitem(
				a({ class: 'item-active' },
					"Revision")
			),
			menuitem(
				a({ href: '/profile/' }, "Profile")
			)
		),
		nav(
			{ class: 'items' },
			menuitem(
				a({ class: 'item-active' },
					"Role")
			)
		)
	);
};

exports['sub-main'] = function () {
	div("test");
};
