'use strict';

exports['user-name'] = function () {
	text("Meta Admin");
};

exports['submitted-menu'] = function () {
	nav(
		ul(
			{ class: 'items' },
			li(
				a({ class: 'item-active', href: '/i18n/' },
					"Application")
			),
			li(
				a({ href: '/profile/' }, "Profile")
			)
		)
	);
};

exports['sub-main'] = function () {
	section(
		{ class: 'section-primary' },
		form(
			h2("Translations"),
			hr(),
			fieldset(
				{ class: 'form-elements' },
				ul(
					['Lorem ipsum dolor sit amet, consectetur adipiscing elit',
						'Lorem ipsum dolor sit amet, consectetur',
						'Lorem ipsum dolor sit amet',
						'Lorem ipsum dolor sit amet, consectetur adipiscing',
						'Lorem ipsum dolor sit amet, consectetur',
						'Lorem ipsum dolor sit amet',
						'Lorem ipsum dolor sit amet, consectetur adipiscing'],
					function (text, index) {
						var id = 'i18n-textarea-' + index;
						div(
							{ class: 'dbjs-input-component ' },
							label({ for: id }, text),
							div(
								{ class: 'input' },
								textarea({ id: id, cols: 60 })
							)
						);
					}
				)
			),
			p(
				{ class: 'submit-placeholder' },
				input({ type: 'submit' })
			)
		)
	);
};
