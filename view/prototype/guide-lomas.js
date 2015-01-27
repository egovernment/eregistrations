'use strict';

var db = require('mano').db
  , user = db.User.prototype;

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
		{ class: 'user-guide-lomas-form' },
		ul(
			{ class: 'user-guide-lomas-form-nav' },
			li(
				{ class: 'user-guide-lomas-form-nav-active', id: 'basic-info-tab' },
				a(
					{ href: '/guide-lomas/' },
					span({ class: 'fa fa-map-marker' }, "Location"),
					"Location of company"
				)
			),
			li({ class: 'user-guide-lomas-form-nav-separator' }, '>'),
			li(
				{ id: 'additional-info-tab' },
				a(
					{ href: '/guide-lomas/secondary-info/' },
					span({ class: 'fa fa-folder-open' }, "Informations"),
					"Other informations"
				)
			)
		),
		div({ class: 'user-guide-lomas-form-components', id: 'user-guide-lomas-form' },
			form(
				section(
					fieldset(
						p("Address of your business?"),
						div({ class: 'input' },
							input({ type: 'text' }),
							input({ type: 'number' })
							),
						div(
							img({ src: '/img/map.png' })
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
										['isLomas', 'isLomas', 'isLomas'],
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
		{ class: 'user-guide-lomas-result' },
		div(
			{ class: 'section-primary user-guide-lomas-result-summary' },
			h3("Your business summary"),
			ul(
				li(
					span({ class: 'user-guide-lomas-result-business-category' }, "Local"),
					span({ class: 'user-guide-lomas-result-business-description' },
							"Lorem ipsum dolor sit amet, consectetur adipiscing elit.")
				),
				li(
					span({ class: 'user-guide-lomas-result-business-category' }, "Property"),
					span({ class: 'user-guide-lomas-result-business-description' },
							"Lorem ipsum dolor sit amet")
				),
				li(
					span({ class: 'user-guide-lomas-result-business-category' }, "Inventory"),
					span({ class: 'user-guide-lomas-result-business-description' },
							"Lorem ipsum dolor sit amet, consectetur adipiscing elit.")
				),
				li(
					span({ class: 'user-guide-lomas-result-business-category' }, "Local"),
					span({ class: 'user-guide-lomas-result-business-description' },
							"Lorem ipsum dolor sit amet,")
				)
			)
		),
		div(
			{ class: 'section-primary user-guide-lomas-result-process' },
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
		ul(
			{ class: 'section-tab-nav', id: 'lomas-guide-tabs' },
			li(a({ class: 'section-tab-nav-tab', href: '#req-tab' },
				"Requirements (10)")),
			li(a({ class: 'section-tab-nav-tab', href: '#cost-tab' },
				"Costs (120$)")),
			li(a({ class: 'section-tab-nav-tab', href: '#cond-tab' },
				"Conditions (12)"))
		),
		div(
			{ class: 'section-primary user-guide-lomas-tab user-guide-lomas-tab-requirements',
				id: 'req-tab' },
			p("Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
				"Duis dolor velit, feugiat ut nulla ac, mollis ornare orci. " +
				"Praesent porttitor dui a ante luctus gravida."),
			ul(
				li(span({ class: 'fa fa-check' }, "Check"),
					"Lorem ipsum dolor sit amet, consectetur adipiscing elit. "),
				li(span({ class: 'fa fa-check' }, "Check"),
					"Lorem ipsum dolor sit amet. "),
				li(span({ class: 'fa fa-check' }, "Check"),
					"Lorem ipsum dolor sit amet, consectetur. "),
				li(span({ class: 'fa fa-check' }, "Check"),
					"Lorem ipsum. "),
				li(span({ class: 'fa fa-check' }, "Check"),
					"Lorem ipsum dolor sit amet, consectetur adipiscing elit. "),
				li(span({ class: 'fa fa-check' }, "Check"),
					"Lorem ipsum dolor sit amet. "),
				li(span({ class: 'fa fa-check' }, "Check"),
					"Lorem ipsum dolor sit amet, consectetur. "),
				li(span({ class: 'fa fa-check' }, "Check"),
					"Lorem ipsum. "),
				li(span({ class: 'fa fa-check' }, "Check"),
					"Lorem ipsum dolor sit amet, consectetur adipiscing elit. ")
			)
		),
		div(
			{ class: 'section-primary user-guide-lomas-tab user-guide-lomas-tab-costs', id: 'cost-tab' },
			p("Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
				"Duis dolor velit, feugiat ut nulla ac, mollis ornare orci. " +
				"Praesent porttitor dui a ante luctus gravida."),
			ul(
				li(span("56$"),
					span("Lorem ipsum dolor sit amet, consectetur adipiscing elit. ")),
				li(span("43$"),
					span("Lorem ipsum dolor sit amet, consectetur elit. ")),
				li(span("123$"),
					span("Lorem ipsum dolor. ")),
				li(span("56$"),
					span("Lorem ipsum dolor sit amet, consectetur adipiscing elit. ")),
				li(span("56$"),
					span("Lorem ipsum dolor sit amet, consectetur. ")),
				li(span("87$"),
					span("Lorem ipsum dolor sit amet. ")),
				li(span("135$"),
					span("Lorem ipsum dolor elit. ")),
				li(span("45$"),
					span("Lorem ipsum dolor sit amet.")),
				li(span("345$"),
					span("Total"))
			)
		),
		div(
			{ class: 'section-primary user-guide-lomas-tab user-guide-lomas-tab-conditions',
				id: 'cond-tab' },
			p("Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
				"Duis dolor velit, feugiat ut nulla ac, mollis ornare orci. " +
				"Praesent porttitor dui a ante luctus gravida."),
			ul(
				li(
					h3("Electricity"),
					table(
						tbody(
							tr(
								td(span({ class: 'fa fa-check' }, "Check")),
								td("Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
										"Duis dolor velit, feugiat ut nulla ac, mollis ornare orci. " +
										"Praesent porttitor dui a ante luctus gravida."),
								td(
									ul(
										li("Ordinance 11025 - ", a("art. 26")),
										li("Ordinance 11025 - ", a("art. 27")),
										li("Ordinance 11025 - ", a("art. 28"))
									)
								)
							),
							tr(
								td(span({ class: 'fa fa-check' }, "Check")),
								td("Lorem ipsum dolor sit amet, consectetur adipiscing elit. "),
								td(
									ul(
										li("Ordinance 11025 - ", a("art. 26")),
										li("Ordinance 11025 - ", a("art. 26"))
									)
								)
							),
							tr(
								td(span({ class: 'fa fa-check' }, "Check")),
								td("Lorem ipsum dolor sit amet, consectetur adipiscing elit. "),
								td(
									ul(
										li("Ordinance 11025 - ", a("art. 26"))
									)
								)
							)
						)
					)
				),
				li(
					h3("Personal"),
					table(
						tbody(
							tr(
								td(span({ class: 'fa fa-check' }, "Check")),
								td("Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
										"Duis dolor velit, feugiat ut nulla ac, mollis ornare orci. " +
										"Praesent porttitor dui a ante luctus gravida."),
								td(
									ul(
										li("Ordinance 11025 - ", a("art. 26")),
										li("Ordinance 11025 - ", a("art. 27")),
										li("Ordinance 11025 - ", a("art. 28"))
									)
								)
							),
							tr(
								td(span({ class: 'fa fa-check' }, "Check")),
								td("Lorem ipsum dolor sit amet, consectetur adipiscing elit. "),
								td(
									ul(
										li("Ordinance 11025 - ", a("art. 26")),
										li("Ordinance 11025 - ", a("art. 26"))
									)
								)
							),
							tr(
								td(span({ class: 'fa fa-check' }, "Check")),
								td("Lorem ipsum dolor sit amet, consectetur adipiscing elit. "),
								td(
									ul(
										li("Ordinance 11025 - ", a("art. 26"))
									)
								)
							)
						)
					)
				),
				li(
					h3("Local"),
					table(
						tbody(
							tr(
								td(span({ class: 'fa fa-check' }, "Check")),
								td("Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
										"Duis dolor velit, feugiat ut nulla ac, mollis ornare orci. " +
										"Praesent porttitor dui a ante luctus gravida."),
								td(
									ul(
										li("Ordinance 11025 - ", a("art. 26")),
										li("Ordinance 11025 - ", a("art. 27")),
										li("Ordinance 11025 - ", a("art. 28"))
									)
								)
							),
							tr(
								td(span({ class: 'fa fa-check' }, "Check")),
								td("Lorem ipsum dolor sit amet, consectetur adipiscing elit. "),
								td(
									ul(
										li("Ordinance 11025 - ", a("art. 26")),
										li("Ordinance 11025 - ", a("art. 26"))
									)
								)
							),
							tr(
								td(span({ class: 'fa fa-check' }, "Check")),
								td("Lorem ipsum dolor sit amet, consectetur adipiscing elit. "),
								td(
									ul(
										li("Ordinance 11025 - ", a("art. 26"))
									)
								)
							)
						)
					)
				)
			)
		)
	);

	legacy('tabs', 'lomas-guide-tabs');

	p({ class: 'user-next-step-button' },
			button({ type: 'submit' },
				"Save and continue"));
};
