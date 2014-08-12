'use strict';

exports.main = function () {
	div({ id: 'user-steps-menu', class: 'steps-menu' },
		div({ class: 'all-menu-items' },
			label({ class: 'step-active show-steps-btn', for: 'show-steps-control' },
				'Steps'
				),
			input({ id: 'show-steps-control', type: 'checkbox', role: 'button' }
				),
			nav({ class: 'steps' },
				menuitem(
					a({ class: 'step-active', href: '/guide/' },
						"1. Guide"),
					div({ 'style': 'width: 100%' })
				),
				menuitem(
					a({ class: 'step-unactive', href: '/forms/' },
						"2. Fill the form"
						),
					div({ style: 'width: 50%' })
				),
				menuitem(
					a({ class: 'step-unactive', href: '/documents/' },
						"3. Upload docs"
						),
					div()
				),
				menuitem(
					a({ class: 'step-unactive' },
						"4. Pay"
						),
					div()
				),
				menuitem(
					a({ class: 'step-unactive', href: '/submission/' },
						"5. Send file"
						),
					div()
				)
				)
			)
		);
	div({ id: 'step' });
};
