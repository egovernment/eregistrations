'use strict';

var copy = require('es5-ext/object/copy'), guide;

exports._parent = require('./_user-logged-in');

exports['submitted-menu'] = function () {
	nav(
		ul(
			{ class: 'submitted-menu-items' },
			li(
				a({ class: 'submitted-menu-item-active' },
					"Demo user")
			),
			li(
				a({ href: '/profile/' }, "Profile")
			)
		)
	);
	nav(
		ul(
			{ class: 'submitted-menu-items' },
			li(
				form(
					{ class: 'submitted-menu-role-select' },
					p(
						select(
							option("Role"),
							option("Official user"),
							option("Admin user"),
							option("User")
						)
					)
				)
			)
		)
	);
};

guide = copy(require('./guide'));

exports['sub-main'] = function () {
	console.log(guide);
	return guide.step();
};
