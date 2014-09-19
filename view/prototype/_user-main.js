'use strict';

exports['user-name'] = function () {
	text("User Name");
};

exports.main = function () {
	div({ class: 'fixed-top-placeholder' },
		div({ id: 'user-steps-menu', class: 'steps-menu', fixed: true },
			div({ class: 'content all-menu-items' },
				label({ class: 'step-active show-steps-btn', for: 'show-steps-control' },
					'Steps'
					),
				input({ id: 'show-steps-control', type: 'checkbox', role: 'button' }
					),
				nav({ class: 'steps' },
					menuitem(
						a({ href: '/guide/', id: 'step-guide' },
							"1. Guide"),
						div({ style: 'width: 100%' })
					),
					menuitem(
						a({ href: '/forms/', id: 'step-form' },
							"2. Fill the form"
							),
						div({ style: 'width: 50%' })
					),
					menuitem(
						a({ href: '/documents/', id: 'step-documents' },
							"3. Upload docs"
							),
						div()
					),
					menuitem(
						a("4. Pay"
							),
						div()
					),
					menuitem(
						a({ href: '/submission/', id: 'step-submission' },
							"5. Send file"
							),
						div()
					)
					)
				)
			)
		);
	div({ class: 'content', id: 'step' });
};
