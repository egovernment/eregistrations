'use strict';

exports.main = function () {
	div({ 'class': 'submitted-menu' },
		div({ 'class': 'all-menu-items' },
			nav({ 'class': 'items' },
				menuitem(
					a({ 'class': 'item-active', 'href': '' },
						"Request")
				),
				menuitem(
					a({ 'class': '', 'href': '' },
						"Profile")
				)
				)
			)
		);
	div({ 'id': 'sub-main' });
};
