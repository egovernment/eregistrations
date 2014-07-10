'use strict';

exports.main = function () {
	div({ 'class': 'steps-menu' },
		nav(
			menuitem(
				button({ 'class': 'btn btn-primary btn-lg' },
					'1. Guide'
					)
			),
			menuitem(
				button({ 'class': 'btn btn-default btn-lg' },
					'2. Fill the form'
					)
			),
			menuitem(
				button({ 'class': 'btn btn-default btn-lg' },
					'3. Upload docs'
					)
			),
			menuitem(
				button({ 'class': 'btn btn-default btn-lg' },
					'4. Pay'
					)
			),
			menuitem(
				button({ 'class': 'btn btn-default btn-lg' },
					'5. Send file'
					)
			)
		)
		);
	section({ 'class': 'business-guide' },
			h3({ 'class': 'main-intro' },
				'INDIVIDUAL REGISTRATION GUIDE FOR COMPANIES'),
			h3('Complete the previous questions, pick your records and' +
					'see the necessary documents and costs'
			),
			form({ 'role': 'form', 'class': 'f-horizontal' },
				fieldset({ 'class': 'm-cont-box' },
					h3('Required records'),
					hr(),
					p('Lorem ipsum dolor sit amet, consectetur adipiscing elit.' +
						' Etiam vestibulum dui mi, nec ultrices diam ultricies id. '),
					p('Lorem ipsum dolor sit amet, consectetur adipiscing elit.' +
						' Etiam vestibulum dui mi, nec ultrices diam ultricies id. ')
				),
				fieldset({ 'class': 'm-cont-box' },
					h4('Required records'),
					hr(),
					p('Lorem ipsum dolor sit amet, consectetur adipiscing elit.' +
						' Etiam vestibulum dui mi, nec ultrices diam ultricies id. ' +
						' Etiam vestibulum dui mi, nec ultrices diam ultricies id. '),
					p('Lorem ipsum dolor sit amet, consectetur adipiscing elit.' +
						' Etiam vestibulum dui mi, nec ultrices diam ultricies id. ' +
						' Etiam vestibulum dui mi, nec ultrices diam ultricies id. ')
				),
				fieldset({ 'class': 'm-cont-box' },
					h3('Documents required'),
					hr(),
					p('Lorem ipsum dolor sit amet, consectetur adipiscing elit.' +
						' Etiam vestibulum dui mi, nec ultrices diam ultricies id. '),
					ul(
					li('Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
					li('Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
					li('Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
					li('Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
					li('Lorem ipsum dolor sit amet, consectetur adipiscing elit.')
				)
				),
				fieldset({ 'class': 'm-cont-box' },
					h4('Costs'),
					hr(),
					p('Lorem ipsum dolor sit amet, consectetur adipiscing elit.' +
						' Etiam vestibulum dui mi, nec ultrices diam ultricies id. '),
					h4({ 'class': 'guide-total-costs' },
						'Total Costs:'
						)
				),
				button({ 'class': 'btn btn-primary btn-lg' },
					'Save and continue'
				)
			)
		);
};
