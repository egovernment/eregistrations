'use strict';

exports._parent = require('../../view/user-base');

exports['submitted-menu'] = function () {
	li(a({ class: 'submitted-menu-item-active', href: '/i18n/' }, "Application"));
};

exports['sub-main'] = {
	class: { content: true, 'user-forms': true },
	content: function () {
		ul(
			{ class: 'pills-nav' },
			li({ class: 'pills-nav-active' }, a({ class: 'pills-nav-pill' }, "Lorem ipsum dolor amet")),
			li(a({ class: 'pills-nav-pill' }, "Lorem ipsum")),
			li(a({ class: 'pills-nav-pill' }, "Lorem ipsum dolor")),
			li(a({ class: 'pills-nav-pill' }, "Lorem ipsum")),
			li(a({ class: 'pills-nav-pill' }, "Lorem ipsum"))
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
	}
};
