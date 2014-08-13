'use strict';

exports.main = function () {
	div({ class: 'submitted-menu' },
		div({ class: 'all-menu-items', id: 'submitted-menu' },
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
