'use strict';

exports['user-name'] = function () {
	text("Translations");
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
					li(
						div(
							{ class: 'dbjs-input-component ' },
							label("Lorem ipsum dolor sit amet, consectetur adipiscing elit"),
							div(
								{ class: 'input' },
								textarea()
							)
						)
					),
					li(
						div(
							{ class: 'dbjs-input-component ' },
							label("Lorem ipsum dolor sit amet, consectetur"),
							div(
								{ class: 'input' },
								textarea()
							)
						)
					),
					li(
						div(
							{ class: 'dbjs-input-component ' },
							label("Lorem ipsum"),
							div(
								{ class: 'input' },
								textarea()
							)
						)
					),
					li(
						div(
							{ class: 'dbjs-input-component ' },
							label("Lorem ipsum dolor sit amet, consectetur adipiscing elit"),
							div(
								{ class: 'input' },
								textarea()
							)
						)
					),
					li(
						div(
							{ class: 'dbjs-input-component ' },
							label("Lorem ipsum dolor sit amet, consectetur adipiscing elit"),
							div(
								{ class: 'input' },
								textarea()
							)
						)
					),
					li(
						div(
							{ class: 'dbjs-input-component ' },
							label("Lorem ipsum dolor sit amet, consectetur"),
							div(
								{ class: 'input' },
								textarea()
							)
						)
					),
					li(
						div(
							{ class: 'dbjs-input-component ' },
							label("Lorem ipsum"),
							div(
								{ class: 'input' },
								textarea()
							)
						)
					),
					li(
						div(
							{ class: 'dbjs-input-component ' },
							label("Lorem ipsum dolor sit amet, consectetur adipiscing elit"),
							div(
								{ class: 'input' },
								textarea()
							)
						)
					)
				)
			),
			p(
				{ class: 'submit-placeholder' },
				input({ type: 'submit' })
			)
		)
	);
};
