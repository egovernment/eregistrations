'use strict';

exports['user-name'] = function () {
	text("Meta Admin");
};

exports['submitted-menu'] = function () {
	nav(
		ul(
			{ class: 'submitted-menu-items' },
			li(
				a({ class: 'submitted-menu-item-active', href: '/i18n/' },
					"Application")
			),
			li(
				a({ href: '/profile/' }, "Profile")
			)
		)
	);
};

exports['sub-main'] = function () {
	ul(
		{ class: 'pills-nav' },
		li({ class: 'pills-nav-pill-active' }, a("Lorem ipsum dolor amet")),
		li(a("Lorem ipsum")),
		li(a("Lorem ipsum dolor")),
		li(a("Lorem ipsum")),
		li(a("Lorem ipsum"))
	);

	section(
		{ class: 'section-primary' },
		form(
			h2("Translations"),
			hr(),
			fieldset(
				{ class: 'form-elements i18n-panel' },
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
								textarea({ id: id })
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
