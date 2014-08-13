'use strict';

exports.main = function () {
	div({ class: 'submitted-menu' },
		div({ class: 'all-menu-items' },
			nav({ class: 'items', id: 'submitted-menu' },
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
