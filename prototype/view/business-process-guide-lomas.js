'use strict';

var location = require('mano/lib/client/location');

exports._parent = require('./business-process-base');

exports['step-guide'] = { class: { 'step-active': true } };

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
				{ id: 'basic-info-tab' },
				a(
					{ href: mmap(location._hash, function (hash) { return '/guide-lomas/' + hash; }) },
					span({ class: 'fa fa-map-marker' }, "Location"),
					"Location of company"
				)
			),
			li({ class: 'user-guide-lomas-form-nav-separator' }, '>'),
			li(
				{ id: 'additional-info-tab' },
				a(
					{ href: mmap(location._hash,
						function (hash) { return '/guide-lomas/form-complement/' + hash; }) },
					span({ class: 'fa fa-folder-open' }, "Informations"),
					"Other informations"
				)
			)
		),
		div({ class: 'user-guide-lomas-form-components', id: 'user-guide-lomas-form' })
	);

	section(
		{ class: 'user-guide-lomas-result' },
		div(
			{ class: 'section-primary user-guide-lomas-result-summary' },
			h3("Your business summary"),
			table(
				tbody(
					tr(
						td({ class: 'user-guide-lomas-result-business-category' }, "Local"),
						td({ class: 'user-guide-lomas-result-business-description ' },
								"Lorem ipsum dolor sit amet, consectetur adipiscing elit.")
					),
					tr(
						td({ class: 'user-guide-lomas-result-business-category' }, "Property"),
						td({ class: 'user-guide-lomas-result-business-description ' },
								"Lorem ipsum dolor sit amet")
					),
					tr(
						td({ class: 'user-guide-lomas-result-business-category' }, "Inventory"),
						td({ class: 'user-guide-lomas-result-business-description ' },
								"Lorem ipsum dolor sit amet, consectetur adipiscing elit.")
					),
					tr(
						td({ class: 'user-guide-lomas-result-business-category' }, "Local"),
						td({ class: 'user-guide-lomas-result-business-description ' },
								"Lorem ipsum dolor sit amet, consectetur adipiscing elit.")
					)
				)
			)
		),
		div(
			{ class: 'section-primary user-guide-lomas-result-process' },
			h3("Your qualification process"),
			div(
				{ class: 'user-guide-lomas-result-warning' },
				p("Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
					"Duis dolor velit, feugiat ut nulla ac, mollis ornare orci. " +
					"Praesent porttitor dui a ante luctus gravida.")
			),
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
			li(a({ class: 'section-tab-nav-tab', href: '.' },
				"Requirements (10)")),
			li(a({ class: 'section-tab-nav-tab', href: '#cost-tab' },
				"Costs (120$)")),
			li(a({ class: 'section-tab-nav-tab', href: '#cond-tab' },
				"Conditions (12)"))
		),
		div(
			{ class: 'section-primary section-tab-nav-tab-content user-guide-lomas-tab-requirements',
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
			{ class: 'section-primary section-tab-nav-tab-content user-guide-lomas-tab-costs',
				id: 'cost-tab' },
			p("Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
				"Duis dolor velit, feugiat ut nulla ac, mollis ornare orci. " +
				"Praesent porttitor dui a ante luctus gravida."),
			ul(
				li(span({ class: 'user-guide-lomas-cost-value' }, "56$"),
					span({ class: 'user-guide-lomas-tab-cost-description' },
							"Lorem ipsum dolor sit amet, consectetur adipiscing elit. ")),
				li(span({ class: 'user-guide-lomas-cost-value' }, "43$"),
					span({ class: 'user-guide-lomas-tab-cost-description' },
							"Lorem ipsum dolor sit amet, consectetur elit. ")),
				li(span({ class: 'user-guide-lomas-cost-value' }, "123$"),
					span({ class: 'user-guide-lomas-tab-cost-description' },
							"Lorem ipsum dolor. ")),
				li(span({ class: 'user-guide-lomas-cost-value' }, "56$"),
					span({ class: 'user-guide-lomas-tab-cost-description' },
							"Lorem ipsum dolor sit amet, consectetur adipiscing elit. ")),
				li(span({ class: 'user-guide-lomas-cost-value' }, "56$"),
					span({ class: 'user-guide-lomas-tab-cost-description' },
							"Lorem ipsum dolor sit amet, consectetur. ")),
				li(span({ class: 'user-guide-lomas-cost-value' }, "87$"),
					span({ class: 'user-guide-lomas-tab-cost-description' },
							"Lorem ipsum dolor sit amet. ")),
				li(span({ class: 'user-guide-lomas-cost-value' }, "135$"),
					span({ class: 'user-guide-lomas-tab-cost-description' },
							"Lorem ipsum dolor elit. ")),
				li(span({ class: 'user-guide-lomas-cost-value' }, "45$"),
					span({ class: 'user-guide-lomas-tab-cost-description' },
							"Lorem ipsum dolor sit amet.")),
				li(span({ class: 'user-guide-lomas-cost-value' }, "345$"),
					span({ class: 'user-guide-lomas-tab-cost-description' },
							"Total"))
			)
		),
		div(
			{ class: 'section-primary section-tab-nav-tab-content',
				id: 'cond-tab' },
			p("Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
				"Duis dolor velit, feugiat ut nulla ac, mollis ornare orci. " +
				"Praesent porttitor dui a ante luctus gravida."),
			ul(
				{ class: 'lomas-conditions-list' },
				li(
					h3("Electricity"),
					table(
						tbody(
							tr(
								td({ class: 'lomas-conditions-status' }, span({ class: 'fa fa-check' }, "Check")),
								td("Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
										"Duis dolor velit, feugiat ut nulla ac, mollis ornare orci. " +
										"Praesent porttitor dui a ante luctus gravida."),
								td(
									{ class: 'lomas-conditions-ordinance-list' },
									ul(
										li("Ordinance 11025 - ", a("art. 26")),
										li("Ordinance 11025 - ", a("art. 27")),
										li("Ordinance 11025 - ", a("art. 28"))
									)
								)
							),
							tr(
								td({ class: 'lomas-conditions-status' }, span({ class: 'fa fa-check' }, "Check")),
								td("Lorem ipsum dolor sit amet, consectetur adipiscing elit. "),
								td(
									{ class: 'lomas-conditions-ordinance-list' },
									ul(
										li("Ordinance 11025 - ", a("art. 26")),
										li("Ordinance 11025 - ", a("art. 26"))
									)
								)
							),
							tr(
								td({ class: 'lomas-conditions-status' }, span({ class: 'fa fa-check' }, "Check")),
								td("Lorem ipsum dolor sit amet, consectetur adipiscing elit. "),
								td(
									{ class: 'lomas-conditions-ordinance-list' },
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
								td({ class: 'lomas-conditions-status' }, span({ class: 'fa fa-check' }, "Check")),
								td("Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
										"Duis dolor velit, feugiat ut nulla ac, mollis ornare orci. " +
										"Praesent porttitor dui a ante luctus gravida."),
								td(
									{ class: 'lomas-conditions-ordinance-list' },
									ul(
										li("Ordinance 11025 - ", a("art. 26")),
										li("Ordinance 11025 - ", a("art. 27")),
										li("Ordinance 11025 - ", a("art. 28"))
									)
								)
							),
							tr(
								td({ class: 'lomas-conditions-status' }, span({ class: 'fa fa-check' }, "Check")),
								td("Lorem ipsum dolor sit amet, consectetur adipiscing elit. "),
								td(
									{ class: 'lomas-conditions-ordinance-list' },
									ul(
										li("Ordinance 11025 - ", a("art. 26")),
										li("Ordinance 11025 - ", a("art. 26"))
									)
								)
							),
							tr(
								td({ class: 'lomas-conditions-status' }, span({ class: 'fa fa-check' }, "Check")),
								td("Lorem ipsum dolor sit amet, consectetur adipiscing elit. "),
								td(
									{ class: 'lomas-conditions-ordinance-list' },
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
								td({ class: 'lomas-conditions-status' }, span({ class: 'fa fa-check' }, "Check")),
								td("Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
										"Duis dolor velit, feugiat ut nulla ac, mollis ornare orci. " +
										"Praesent porttitor dui a ante luctus gravida."),
								td(
									{ class: 'lomas-conditions-ordinance-list' },
									ul(
										li("Ordinance 11025 - ", a("art. 26")),
										li("Ordinance 11025 - ", a("art. 27")),
										li("Ordinance 11025 - ", a("art. 28"))
									)
								)
							),
							tr(
								td({ class: 'lomas-conditions-status' }, span({ class: 'fa fa-check' }, "Check")),
								td("Lorem ipsum dolor sit amet, consectetur adipiscing elit. "),
								td(
									{ class: 'lomas-conditions-ordinance-list' },
									ul(
										li("Ordinance 11025 - ", a("art. 26")),
										li("Ordinance 11025 - ", a("art. 26"))
									)
								)
							),
							tr(
								td({ class: 'lomas-conditions-status' }, span({ class: 'fa fa-check' }, "Check")),
								td("Lorem ipsum dolor sit amet, consectetur adipiscing elit. "),
								td(
									{ class: 'lomas-conditions-ordinance-list' },
									ul(
										li("Ordinance 11025 - ", a("art. 26"))
									)
								)
							)
						)
					)
				),
				li(
					h3("Lorem ipsum"),
					table(
						tbody(
							tr(
								td({ class: 'lomas-conditions-status' }, span({ class: 'fa fa-check' }, "Check")),
								td("Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
										"Duis dolor velit, feugiat ut nulla ac, mollis ornare orci. " +
										"Praesent porttitor dui a ante luctus gravida.")
							),
							tr(
								td({ class: 'lomas-conditions-status' }, span({ class: 'fa fa-check' }, "Check")),
								td("Lorem ipsum dolor sit amet, consectetur adipiscing elit. ")
							),
							tr(
								td({ class: 'lomas-conditions-status' }, span({ class: 'fa fa-check' }, "Check")),
								td("Lorem ipsum dolor sit amet, consectetur adipiscing elit. ")
							)
						)
					)
				)
			)
		)
	);

	legacy('hashNavTabs', 'lomas-guide-tabs', 'req-tab');

	p({ class: 'user-next-step-button' },
			button({ type: 'submit' },
				"Save and continue"));
};
