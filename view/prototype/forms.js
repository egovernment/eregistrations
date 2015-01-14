'use strict';

var db = require('mano').db
  , generateSections = require('../components/generate-form-sections')
  , user = db.User.prototype;

exports['step-form'] = { class: { 'step-active': true } };

exports.step = function () {
	h1("2. Fill the form");

	div({ class: 'error-main' },
		p(span({ class: 'fa fa-exclamation-circle' }), "Please fill the Guide first"));

	div({ class: 'info-main' },
		h3("Observation"),
		p("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed feugiat aliquet massa."),
		ul(
			li(
				h4("Lorem ipsum dolor sit amet, consectetur adipiscing elit: "),
				p("Lorem ipsum dolor sit amet, consectetur")
			),
			li(
				h4("Lorem ipsum dolor sit amet, consectetur adipiscing elit: "),
				p("LoLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed feugiat aliquet massa," +
					" quis vulputate diam. Morbi non dolor ac tellus finibus commodo. Donec convallis" +
					" tortor felis, et sodales quam vulputate ac.")
			)
		),
		p("Lorem ipsum dolor sit amet, consectetur adipiscing elit"));

	div(
		{ class: 'disabler-range', id: 'forms-disabler-range' },
		generateSections(user.formSections),
		div({ class: 'user-next-step-button' },
			a({ href: '/documents/' }, "Continue to next step")),
		div({ class: 'disabler' })
	);
};
