'use strict';

module.exports = exports = require('../../view/user-profile');

exports['submitted-menu'] = function () {
	nav(
		ul(
			{ class: 'submitted-menu-items' },
			li(
				a({ href: '/guide/', class: 'submitted-menu-item-active' },
					"Process")
			),
			li(
				a({ href: '/profile/' }, "Profile")
			)
		)
	);
};
