'use strict';

exports.main = function () {
	div({ class: 'submitted-menu', id: 'submitted-menu' },
		div({ class: 'all-menu-items' },
			nav({ class: 'items' },
				menuitem(
					a({ class: 'item-active' },
						"Request")
				),
				menuitem(
					a("Profile")
				)
				)
			)
		);
	div({ 'id': 'sub-main' });
};
