'use strict';

var db = require('mano').db
  , user = db.User.prototype;
//  , reqRadio;

exports['step-guide'] = { class: { 'step-active': true } };

require('./_inventory');

exports.step = function () {
	h1("1. Individual registration guide for companies - lomas like");

	section(
		{ class: 'section-primary user-guide-lomas-intro' },
		p("This guide allows you to determine the requirements, " +
			"costs and enabling conditions for trade."),
		ol(
			li("Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
				"Duis dolor velit, feugiat ut nulla ac, mollis ornare orci. " +
				"Praesent porttitor dui a ante luctus gravida."),
			li("Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
				"Duis dolor velit, feugiat ut nulla ac, mollis ornare orci. ")
		)
	);

	section(
		{ class: 'user-guide-lomas-basic-section' },
		ul(
			{ class: 'user-guide-lomas-basic-section-nav' },
			li(
				{ class: 'user-guide-lomas-basic-section-nav-active' },
				a("Location of company")
			),
			li({ class: 'user-guide-lomas-basic-section-nav-separator' }, '>'),
			li(
				a("Other informations")
			)
		),
		div({ class: 'user-guide-lomas-basic-section-components' },
			form(
				fieldset(
					p("Address of your business?"),
					div({ class: 'input' },
						input({ type: 'text' }),
						input({ type: 'number' })
						),
					div(
						iframe({ src: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d2760.18457802187!2d6.1402920000000005!3d46.226674!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x478c64fcaacb2e3f%3A0x86f47c470f8978b7!2sUnited+Nations+Office+at+Geneva!5e0!3m2!1spl!2spl!4v1421919850718' })
					),
					p("Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
							"Duis dolor velit, feugiat ut nulla ac, mollis ornare orci. " +
							"Praesent porttitor dui a ante luctus gravida.")
				),
				fieldset(
					p("Business activity?"),
					ul({ class: 'form-elements' },
						['businessActivity',
							'surfaceArea',
							'inventory',
							'descriptionText'],
						function (name) { 
							li(
								div({ class: 'input' },
									input({ control: { id: 'input-' + name }, dbjs: user.getObservable(name), placeholder: user.getDescriptor(name).label }))
							);
						 }
					)
				),
				div(
					p("Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
							"Duis dolor velit, feugiat ut nulla ac, mollis ornare orci. "),
					input({ type: 'submit' })
				)
			)
			)
	);

	section(
		{ class: 'user-guide-lomas-information-section' },
		div(
			{ class: 'section-primary' },
			h3("Your business summary"),
			ul(
				li(
					span("Local"),
					span("Lorem ipsum dolor sit amet,")
				),
				li(
					span("Local"),
					span("Lorem ipsum dolor sit amet,")
				),
				li(
					span("Local"),
					span("Lorem ipsum dolor sit amet,")
				),
				li(
					span("Local"),
					span("Lorem ipsum dolor sit amet,")
				)
			)
		),
		div(
			{ class: 'section-primary' },
			h3("Your qualification process"),
			ol(
				li("Lorem ipsum dolor sit amet, consectetur adipiscing elit. "),
				li("Lorem ipsum dolor sit amet, consectetur adipiscing elit. "),
				li("Lorem ipsum dolor sit amet, consectetur adipiscing elit. "),
				li("Lorem ipsum dolor sit amet, consectetur adipiscing elit. "),
				li("Lorem ipsum dolor sit amet, consectetur adipiscing elit. ")
			)
		)
	);

	section(
		{ class: 'section-tab-nav' },
		a({ class: 'section-tab-nav-tab active' }, "Requirements (10)"),
		a({ class: 'section-tab-nav-tab' }, "Costs (120$)"),
		div(
			{ class: 'section-primary' },
			p("Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
				"Duis dolor velit, feugiat ut nulla ac, mollis ornare orci. " +
				"Praesent porttitor dui a ante luctus gravida."),
			ul(
				li("Lorem ipsum dolor sit amet, consectetur adipiscing elit. "),
				li("Lorem ipsum dolor sit amet, consectetur adipiscing elit. "),
				li("Lorem ipsum dolor sit amet, consectetur adipiscing elit. "),
				li("Lorem ipsum dolor sit amet, consectetur adipiscing elit. "),
				li("Lorem ipsum dolor sit amet, consectetur adipiscing elit. ")
			)
		)
	);
	p({ class: 'user-next-step-button' },
			button({ type: 'submit' },
				"Save and continue"));
};
