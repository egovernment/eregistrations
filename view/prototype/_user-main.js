'use strict';

exports.main = function () {
	div({ 'class': 'steps-menu' },
		div({ 'class': 'all-menu-items' },
			label({ 'class': 'step-active show-steps-btn', 'for': 'show-steps-control' },
				'Steps'
				),
			input({ 'id': 'show-steps-control', 'type': 'checkbox', 'role': 'button' }
				),
			nav({ 'class': 'steps' },
				menuitem(a({ 'class': 'step-active', 'href': '/guide' }, "1. Guide")),
				menuitem(
					a({ 'class': 'step-unactive', 'href': '/forms' },
						"2. Fill the form"
						)
				),
				menuitem(
					a({ 'class': 'step-unactive', 'href': '#' },
						"3. Upload docs"
						)
				),
				menuitem(
					a({ 'class': 'step-unactive' },
						"4. Pay"
						)
				),
				menuitem(
					a({ 'class': 'step-unactive' },
						"5. Send file"
						)
				)
				)
			)
		);
	div({ 'id': 'step' });
};
