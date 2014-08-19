'use strict';

exports.main = function () {
	div({ class: 'submitted-menu' },
		div({ class: 'submitted-all-menu-items navs-both-sides', id: 'submitted-menu' },
			nav({ class: 'items' },
				menuitem(
					a({ class: 'item-active' },
						"Request")
				),
				menuitem(
					a({ href: '/profile/' }, "Profile")
				)
				)
			)
		);
	div({ 'id': 'sub-main' });
};
