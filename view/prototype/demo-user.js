'use strict';

var copy = require('es5-ext/object/copy');

exports = module.exports = copy(require('./_user-main'));

exports['submitted-menu'] = function () {
	nav(
		ul(
			{ class: 'items' },
			li(
				a({ class: 'item-active' },
					"Demo user")
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
				select({ class: 'role-select' },
						option("Role"),
						option("Official user"),
						option("Admin user"),
						option("User")
					)
			)
		)
	);
};

exports['sub-main'] = {
	class: { content: false, 'demo-user': true },
	'': exports.main
};

delete exports.main;
