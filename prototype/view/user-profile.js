'use strict';

module.exports = exports = require('../../view/user-profile');

exports['submitted-menu'] = function () {
	nav(ul({ class: 'submitted-menu-items' },
			li(a({ href: '/guide/' }, "Process")),
			li(a({ href: '/profile/', class: 'submitted-menu-item-active' }, "Profile"))));
};
