'use strict';

exports['user-name'] = function () {
	text("User Name");
};

exports.main = function () {
	div({ id: 'user-steps-menu', class: 'steps-menu' },
		div({ class: 'content all-menu-items' },
			label({ class: 'step-active show-steps-btn', for: 'show-steps-control' },
				'Steps'
				),
			input({ id: 'show-steps-control', type: 'checkbox', role: 'button' }
				),
			nav({ class: 'steps' },
				menuitem(
					a({ class: 'step-active', href: '/guide/' },
						"1. Guide"),
					div({ style: 'width: 100%' })
				),
				menuitem(
					a({ class: 'step-inactive', href: '/forms/' },
						"2. Fill the form"
						),
					div({ style: 'width: 50%' })
				),
				menuitem(
					a({ class: 'step-inactive', href: '/documents/' },
						"3. Upload docs"
						),
					div()
				),
				menuitem(
					a({ class: 'step-inactive' },
						"4. Pay"
						),
					div()
				),
				menuitem(
					a({ class: 'step-inactive', href: '/submission/' },
						"5. Send file"
						),
					div()
				)
				)
			)
		);
	div({ class: 'content', id: 'step' });
};
