'use strict';

//var db = require('mano').db
//  , user = db.User.prototype
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
		{ class: 'section-primary' },
		ul(
			{ class: 'user-guide-lomas-basic-section-nav' },
			li(
				a("Location of company")
			),
			li(
				a("Other informations")
			)
		),
		div({ class: 'user-guide-lomas-basic-section-component' },
			form(
				fieldset(
					p("Address of your business?"),
					input(),
					div('map'),
					p("Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
							"Duis dolor velit, feugiat ut nulla ac, mollis ornare orci. " +
							"Praesent porttitor dui a ante luctus gravida.")
				),
				fieldset(
					ul(
						li(input()),
						li(input())
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
		a({ class: 'section-tab-nav-tab active' }, "Requirements"),
		a({ class: 'section-tab-nav-tab' }, "Costs"),
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
