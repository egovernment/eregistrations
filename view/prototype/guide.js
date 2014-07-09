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
			h3('INDIVIDUAL REGISTRATION GUIDE FOR COMPANIES',
				br(),
				small('Complete the previous questions, pick your records and' +
					'see the necessary documents and costs')
			),
			form({ 'role': 'form', 'class': 'f-horizontal' },
				fieldset({ 'class': 'm-cont-box' },
					h4('Basic questions'),
					hr(),
					p('Lorem ipsum dolor sit amet, consectetur adipiscing elit.' +
						' Etiam vestibulum dui mi, nec ultrices diam ultricies id. '),
					label({ 'for': 'asset' },
						'Curent value of the asset:'
						),
					div({ 'class': 'input-group' },
						span({ 'class': 'input-group-addon' }, '$'),
						input({ 'class': 'form-control', 'id': 'asset', 'type': 'number' })
						),
					label({ 'for': 'sales' },
						'Total sales completed or planned:'
						),
					div({ 'class': 'input-group' },
						span({ 'class': 'input-group-addon' }, '$'),
						input({ 'class': 'form-control', 'id': 'sales', 'type': 'number'  })
						),
					label({ 'for': 'workers' },
						'Employed worker(s)?'
						),
					div({ 'class': 'radio' },
						input({ 'class': 'form-control',
							'id': 'workers', 'type': 'radio', 'value': 'Yes'  }),
						label('test'),
						input({ 'class': 'form-control', 'id': 'workers', 'type': 'radio', 'value': 'No'  })
						),
					label({ 'for': 'side' },
						'Has property (s) side (s)?'
						),
					div({ 'class': 'input-group' },
						span({ 'class': 'input-group-addon' }, 'No.'),
						input({ 'class': 'form-control', 'id': 'side', 'type': 'number'  })
					),
					label({ 'for': 'side' },
						'Has property (s) side (s)?'
						),
					div({ 'class': 'checkbox' },
						input({ 'class': 'form-control',
							'id': 'property', 'type': 'checkbox', 'value': 'Yes'  }),
						label('Yes')
						)
				),
				fieldset({ 'class': 'm-cont-box' },
					h4('Required records'),
					hr(),
					p('Lorem ipsum dolor sit amet, consectetur adipiscing elit.' +
						' Etiam vestibulum dui mi, nec ultrices diam ultricies id. ' +
						' Etiam vestibulum dui mi, nec ultrices diam ultricies id. '),
					div({ 'class': 'checkbox' },
					input({ 'class': 'form-control', 'id': 'property', 'type': 'checkbox', 'value': 'Yes'  }),
					label('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam')
					),
					div({ 'class': 'checkbox' },
					input({ 'class': 'form-control', 'id': 'property', 'type': 'checkbox', 'value': 'Yes'  }),
					label('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam')
					),
					div({ 'class': 'checkbox' },
					input({ 'class': 'form-control', 'id': 'property', 'type': 'checkbox', 'value': 'Yes'  }),
					label('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam')
					),
					div({ 'class': 'checkbox' },
					input({ 'class': 'form-control', 'id': 'property', 'type': 'checkbox', 'value': 'Yes'  }),
					label('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam')
					),
					h4('Optional records'),
					hr(),
					div({ 'class': 'f-horizontal guide-records' },
						div({ 'class': 'checkbox' },
						input({ 'class': 'form-control',
							'id': 'property', 'type': 'checkbox', 'value': 'Yes'  }),
						label('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam')
						)
					)
				),
				fieldset({ 'class': 'm-cont-box' },
					h4('Documents required'),
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
					h5({ 'class': 'guide-total-costs' },
						'Total Costs:'
						)
				),
				button({ 'class': 'btn btn-primary btn-lg' },
					'Save and continue'
				)
			)
		);
};
