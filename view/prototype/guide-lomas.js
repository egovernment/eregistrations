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
		{ class: 'user-guide-lomas-basic' },
		ul(
			{ class: 'user-guide-lomas-basic-nav' },
			li(
				{ class: 'user-guide-lomas-basic-nav-active', id: 'basic-info-tab' },
				a(
					{ href: '/guide-lomas/' },
					span({ class: 'fa fa-map-marker' }, "Location"),
					"Location of company"
				)
			),
			li({ class: 'user-guide-lomas-basic-nav-separator' }, '>'),
			li(
				{ id: 'additional-info-tab' },
				a(
					{ href: '/guide-lomas/secondary-info/' },
					span({ class: 'fa fa-folder-open' }, "Informations"),
					"Other informations"
				)
			)
		),
		div({ class: 'user-guide-lomas-basic-components', id: 'user-guide-lomas-basic' },
			form(
				section(
					fieldset(
						p("Address of your business?"),
						div({ class: 'input' },
							input({ type: 'text' }),
							input({ type: 'number' })
							),
						div(
							iframe({ src: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3' +
								'!1d2760.18457802187!2d6.1402920000000005!3d46.226674!3m2!1i102' +
								'4!2i768!4f13.1!3m3!1m2!1s0x478c64fcaacb2e3f%3A0x86f47c470f8978' +
								'b7!2sUnited+Nations+Office+at+Geneva!5e0!3m2!1spl!2spl!4v1421919850718' })
						),
						p(span({ class: 'fa fa-info-circle' }, "Information:"),
							"Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
								"Duis dolor velit, feugiat ut nulla ac, mollis ornare orci. " +
								"Praesent porttitor dui a ante luctus gravida.")
					),
					fieldset(
						p("Business activity?"),
						ul({ class: 'form-elements' },
							['businessActivity',
								'surfaceArea',
								'descriptionText',
								'questions'
								],
							function (name) {
								if (name === 'questions') {
									ul(
										['isLomas', 'isLomas'],
										function (name) {
											li(
												{ class: 'input' },
												span(user.getDescriptor(name).label),
												input({ control: { id: 'input-' + name }, dbjs: user.getObservable(name) })
											);
										}
									);
								} else {
									li(
										div({ class: 'input' },
											input({ control: { id: 'input-' + name },
												dbjs: user.getObservable(name),
													placeholder: user.getDescriptor(name).label }))
									);
								}
							}
							)
					)
				),
				div(
					p(input({ type: 'submit' })),
					p(span({ class: 'fa fa-info-circle' }, "Information:"),
							"Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
							"Duis dolor velit, feugiat ut nulla ac, mollis ornare orci. ")
				)
			)
			)
	);

	section(
		{ class: 'user-guide-lomas-information' },
		div(
			{ class: 'section-primary user-guide-lomas-information-summary' },
			h3("Your business summary"),
			ul(
				li(
					span("Local"),
					span("Lorem ipsum dolor sit amet, consectetur adipiscing elit.")
				),
				li(
					span("Property"),
					span("Lorem ipsum dolor sit amet")
				),
				li(
					span("Inventory"),
					span("Lorem ipsum dolor sit amet, consectetur adipiscing elit.")
				),
				li(
					span("Local"),
					span("Lorem ipsum dolor sit amet,")
				)
			)
		),
		div(
			{ class: 'section-primary user-guide-lomas-information-process' },
			h3("Your qualification process"),
			ol(
				li("Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
						"Lorem ipsum dolor sit amet, consectetur adipiscing elit. "),
				li("Lorem ipsum dolor sit amet, consectetur adipiscing elit. "),
				li("Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
						"Lorem ipsum dolor sit amet, consectetur adipiscing elit. "),
				li("Lorem ipsum dolor sit amet, consectetur adipiscing elit. "),
				li("Lorem ipsum dolor sit amet, consectetur adipiscing elit. ")
			)
		)
	);

	section(
		{ class: 'section-tab-nav' },
		a({ class: 'section-tab-nav-tab active', href: '/guide-lomas/', id: 'req-tab' },
				"Requirements (10)"),
		a({ class: 'section-tab-nav-tab', href: '/guide-lomas/costs/', id: 'cost-tab'  },
				"Costs (120$)"),
		a({ class: 'section-tab-nav-tab', href: '/guide-lomas/conditions/', id: 'cond-tab'  },
				"Conditions (12)"),
		div(
			{ class: 'section-primary', id: 'summary-tabs' },
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
