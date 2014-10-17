'use strict';

var location = require('mano/lib/client/location');

exports['user-name'] = function () {
	text("User Name");
};

exports.main = function () {

	var mobileCheckbox;

	div({ class: 'fixed-top-placeholder' },
		nav({ id: 'user-steps-menu', class: 'steps-menu', fixed: true },
			div({ class: 'content all-menu-items' },
				label({ class: 'step-active show-steps-btn', for: 'show-steps-control' },
					'Steps'
					),
				mobileCheckbox = input({ id: 'show-steps-control', type: 'checkbox', role: 'button' }
					),
				ul({ class: 'steps' },
					li(
						a({ href: '/guide/', id: 'step-guide' },
							"1. Guide"),
						div({ style: 'width: 100%' })
					),
					li(
						a({ href: '/forms/', id: 'step-form' },
							"2. Fill the form"
							),
						div({ style: 'width: 50%' })
					),
					li(
						a({ href: '/documents/', id: 'step-documents' },
							"3. Upload docs"
							),
						div()
					),
					li(
						a("4. Pay"
							),
						div()
					),
					li(
						a({ href: '/submission/', id: 'step-submission' },
							"5. Send file"
							),
						div()
					)
					)
				)
			)
		);
	div({ class: 'content user-forms', id: 'step' });

	location.on('change', function () {
		mobileCheckbox.checked = false;
	});

};
