'use strict';

exports.main = function () {
	div({ 'class': 'steps-menu' },
		div({ 'class': 'all-menu-items' },
			label({ 'class': 'btn btn-primary btn-lg show-steps-btn', 'for': 'show-steps-control' },
				'Steps'
				),
			input({ 'id': 'show-steps-control', 'type': 'checkbox', 'role': 'button' }
				),
			nav({ 'class': 'steps' },
				menuitem(
					a({ 'class': 'btn btn-primary btn-lg' },
						"1. Guide"
						)
				),
				menuitem(
					a({ 'class': 'btn btn-default btn-lg' },
						"2. Fill the form"
						)
				),
				menuitem(
					a({ 'class': 'btn btn-default btn-lg' },
						"3. Upload docs"
						)
				),
				menuitem(
					a({ 'class': 'btn btn-default btn-lg' },
						"4. Pay"
						)
				),
				menuitem(
					a({ 'class': 'btn btn-default btn-lg' },
						"5. Send file"
						)
				)
				)
			)
		);

	section({ 'class': 'user-guide' },
			h3({ 'class': 'main-intro' },
				"INDIVIDUAL REGISTRATION GUIDE FOR COMPANIES"),
			h3("Complete the previous questions, pick your records and" +
					"see the necessary documents and costs"
			),
			form({ 'role': 'form', 'class': 'guide-form' },
				fieldset({ 'class': 'm-cont-box' },
					h3("Questions"),
					hr(),
					p("Lorem ipsum dolor sit amet, consectetur adipiscing elit." +
						" Etiam vestibulum dui mi, nec ultrices diam ultricies id. "),
					p("Lorem ipsum dolor sit amet, consectetur adipiscing elit." +
						" Etiam vestibulum dui mi, nec ultrices diam ultricies id. ")
				),
				fieldset({ 'class': 'm-cont-box' },
					h3("Registrations"),
					hr(),
					p("Lorem ipsum dolor sit amet, consectetur adipiscing elit." +
						" Etiam vestibulum dui mi, nec ultrices diam ultricies id. " +
						" Etiam vestibulum dui mi, nec ultrices diam ultricies id. "),
					p("Lorem ipsum dolor sit amet, consectetur adipiscing elit." +
						" Etiam vestibulum dui mi, nec ultrices diam ultricies id. " +
						" Etiam vestibulum dui mi, nec ultrices diam ultricies id. ")
				),
				fieldset({ 'class': 'm-cont-box' },
					h3("Requirements"),
					hr(),
					p("Lorem ipsum dolor sit amet, consectetur adipiscing elit." +
						" Etiam vestibulum dui mi, nec ultrices diam ultricies id. "),
					ul(
					li("Lorem ipsum dolor sit amet, consectetur adipiscing elit."),
					li("Lorem ipsum dolor sit amet, consectetur adipiscing elit."),
					li("Lorem ipsum dolor sit amet, consectetur adipiscing elit."),
					li("Lorem ipsum dolor sit amet, consectetur adipiscing elit."),
					li("Lorem ipsum dolor sit amet, consectetur adipiscing elit.")
				)
				),
				fieldset({ 'class': 'm-cont-box' },
					h3("Costs"),
					hr(),
					p("Lorem ipsum dolor sit amet, consectetur adipiscing elit." +
						" Etiam vestibulum dui mi, nec ultrices diam ultricies id. "),
					h4({ 'class': 'guide-total-costs' },
						"Total Costs:"
						)
				),
				button({ 'class': 'btn btn-primary btn-lg' },
					"Save and continue"
				)
			)
		);
};
