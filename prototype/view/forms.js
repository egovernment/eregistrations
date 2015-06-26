// Forms step page

'use strict';

var db = require('mano').db
  , generateSections = require('../components/generate-form-sections')
  , user = db.User.prototype;

exports._parent = require('./_user-main');

exports['step-form'] = { class: { 'step-active': true } };

exports.step = function () {
	div(
		{ class: 'capital-first' },
		div("2"),
		div(h1("Fill the form"),
			p("Lorem ipsum dolor sit amet, consectetur adipiscing elit."))
	);

	div({ class: 'error-main' },
		p(span({ class: 'fa fa-exclamation-circle' }), "Please fill the Guide first"));

	div({ class: 'info-main free-form' },
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

		section(
			{ class: 'section-primary' },
			form(
				h2("Business Owner sides informations"),
				hr(),
				div(
					{ class: 'section-primary-sub' },
					h3("First Sub Section"),
					div(
						{ class: 'section-sides' },
						div(
							ul({ class: 'form-elements' },
								['businessActivity',
									'isOwner',
									'surfaceArea',
									'members',
									'companyType'],
								function (name) {
									li(div({ class: 'dbjs-input-component' },
										label(
											{ for: 'input-' + name },
											user.getDescriptor(name).label,
											":"
										),
										div({ class: 'input' },
											input({ control: { id: 'input-' + name },
												dbjs: user.getObservable(name) }))));
								})
						),
						div(
							div({ class: 'user-guide-lomas-map',
								style: 'background-image: url(\'../img/map.png\')' }),
							p("Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
									"Duis dolor velit, feugiat ut nulla ac, mollis ornare orci. " +
									"Praesent porttitor dui a ante luctus gravida.")
						)
					)
				),
				div(
					{ class: 'section-primary-sub' },
					h3("Second Sub Section"),
					ul({ class: 'form-elements' },
						['businessActivity',
							'companyName',
							'isOwner',
							'surfaceArea',
							'members',
							'companyType'],
						function (name) {
							if (name === 'companyName') {
								li(div({ class: 'dbjs-input-component' },
									label(
										{ for: 'input-' + name },
										user.getDescriptor(name).label,
										":"
									),
									div(
										{ class: 'input' },
										input({ control: { id: 'input-' + name }, dbjs: user.getObservable(name) }),
										span({ class: 'verification-status verification-status-positive' },
											span({ class: 'label-reg approved verification-status-positive' },
												"Company name allowed"),
											span({ class: 'label-reg rejected verification-status-negative' },
												"Company name occupied")),
										span({ class: 'scrollable-list-box-described' },
											ul(li('First Company Name'),
												li('Second Company Name'),
												li('Third Company Name'),
												li('Fourth Company Name'),
												li('Fifth Company Name'),
												li('Sixth Company Name')),
											p("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce " +
													"efficitur mattis dolor, non facilisis felis varius feugiat. Nulla" +
													" tincidunt odio sit amet euismod viverra."
												)
											)
									)));
							} else {
								li(div({ class: 'dbjs-input-component' },
									label(
										{ for: 'input-' + name },
										user.getDescriptor(name).label,
										":"
									),
									div({ class: 'input' },
										input({ control: { id: 'input-' + name }, dbjs: user.getObservable(name) }))));
							}
						})
				)
			)
		),

		div({ class: 'user-next-step-button' },
			a({ href: '/documents/' }, "Continue to next step")),
		div({ class: 'disabler' })
	);
};
