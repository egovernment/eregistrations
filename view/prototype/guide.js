'use strict';

var db = require('mano').db

  , user = db.User.prototype
  , reqRadio;

exports['step-guide'] = { class: { 'step-active': true } };

require('./_inventory');

exports.step = function () {
	h1("1. Individual registration guide for companies");

	form(
		{ class: 'user-guide' },
		div({ class: 'section-primary' }, h2("Questions"),
			hr(),
			ul({ class: 'form-elements' },
				['businessActivity',
					'isOwner',
					'inventory',
					'surfaceArea', 'members',
					'companyType',
					'isShoppingGallery',
					'autocomplet'],
				function (name) {
					if (name === 'inventory') {
						div({ class: 'dbjs-input-component' },
							label({ for: 'input-' + name }, user.getDescriptor(name).label, ":"),
							div({ class: 'input' },
								input({ control: { id: 'input-' + name }, dbjs: user.getObservable(name) })));
						div({ class: 'user-guide-inventory-button' },
							a({ href: '#inventory' },
								span({ class: 'fa fa-calculator user-guide-inventory-icon' }, "Calculator"),
								span({ class: 'user-guide-inventory-label' }, "Calculate the amount")));
					} else if (name === 'isShoppingGallery') {
						li(div({ class: 'dbjs-input-component' },
							label(
								{ for: 'input-' + name },
								"Is shopping gallery?"
							),
							div({ class: 'input' },
								input({ control: { id: 'input-' + name }, dbjs: user.getObservable(name),
									type: 'checkbox' }))));
					} else if (name === 'autocomplet') {
						li(div({ class: 'dbjs-input-component' },
								label('Autocomplet input:'),
								div({ class: 'input' },
									input({ list: 'datalist', type: 'text', placeholder: 'Start typing' })),
								datalist({ id: 'datalist' },
									option('Adam'),
									option('Alan'),
									option('Frank'),
									option('Viene'),
									option('Bita'))));
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
				})),
		div(
			{ class: 'section-primary' },
			h2("Registrations"),
			hr(),
			p("Lorem ipsum dolor sit amet, consectetur adipiscing elit." +
				" Etiam vestibulum dui mi, nec ultrices diam ultricies id. " +
				" Etiam vestibulum dui mi, nec ultrices diam ultricies id. "),
			ul(li(label({ class: 'input-aside' },
				input({ dbjs: user._isARequested, type: 'checkbox', control: { class: 'readonly' } }), " ",
				span(user.getDescriptor('isARequested').label))),
				li(label({ class: 'input-aside' },
					input({ dbjs: user._isARequested, type: 'checkbox' }), " ",
					span(user.getDescriptor('isBRequested').label))),
				li(label({ class: 'input-aside' },
					input({ dbjs: user._isARequested, type: 'checkbox' }), " ",
					span(user.getDescriptor('isARequested').label)))),
			div(
				{ class: 'section-primary-wrapper' },
				h2("Optional Registrations"),
				hr(),
				ul(li(label({ class: 'input-aside' },
					input({ dbjs: user._isARequested, type: 'checkbox', control: { class: 'readonly' } }),
					" ",
					span(user.getDescriptor('isARequested').label))),
					li(label({ class: 'input-aside' },
						input({ dbjs: user._isARequested, type: 'checkbox' }), " ",
						span(user.getDescriptor('isBRequested').label))))
			)
		),

		div({ class: 'section-primary' }, h2("Requirements"),
			hr(),
			p("Lorem ipsum dolor sit amet, consectetur adipiscing elit." +
				" Etiam vestibulum dui mi, nec ultrices diam ultricies id. "),
			ul({ class: 'user-guide-requirements-list' },
				li("Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
					" Lorem ipsum dolor sit amet, consectetur adipiscing elit."),
				li("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum " +
					"dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet," +
					" consectetur adipiscing elit."),
				li("Lorem ipsum dolor sit amet, consectetur adipiscing elit."),
				li("Lorem ipsum dolor sit amet, consectetur adipiscing elit."),
				li("Lorem ipsum dolor sit amet, consectetur adipiscing elit."),
				li("Lorem ipsum dolor sit amet: ",
					ul(li(reqRadio = input({ dbjs: user._isType, type: 'radio',
						renderOption: function (labelTxt) {
							var data = {};
							data.dom = li(label({ class: 'input-aside' },
								span(data.input = input()),
								span(labelTxt)));
							return data;
						}  }), " "))),
				li(
					"Please choose x docs in the list: ",
					ul(
						li(label({ class: 'input-aside' },
							input({ dbjs: user._isARequested, type: 'checkbox' }), " ",
							span(user.getDescriptor('isBRequested').label))),
						li(label({ class: 'input-aside' },
							input({ dbjs: user._isARequested, type: 'checkbox' }), " ",
							span(user.getDescriptor('isBRequested').label))),
						li(
							label({ class: 'input-aside' }, input({ dbjs: user._isBRequested,
								type: 'checkbox',
								control: { class: 'readonly' },
								value: 'checked' }),
								" ",
								span(user.getDescriptor('isBRequested').label))
						),
						li(label({ class: 'input-aside' },
							input({ dbjs: user._isARequested, type: 'checkbox' }), " ",
							span(user.getDescriptor('isARequested').label))),
						li(label({ class: 'input-aside' },
							input({ dbjs: user._isARequested, type: 'checkbox' }), " ",
							span(user.getDescriptor('isBRequested').label)))
					)
				))),
		div({ class: 'section-primary' }, h2("Costs"),
			hr(),
			div(
				{ class: 'free-form' },
				p("LoLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed feugiat aliquet massa," +
					" quis vulputate diam. Morbi non dolor ac tellus finibus commodo. Donec convallis" +
					" tortor felis, et sodales quam vulputate ac."),
				ul(
					li(
						p("Lorem ipsum dolor sit amet, consectetur adipiscing elit"),
						ul(
							li("Lorem ipsum dolor sit amet, consectetur adipiscing elit"),
							li("Lorem ipsum dolor sit amet, consectetur adipiscing elit")
						)
					),
					li("Lorem ipsum dolor sit amet, consectetur adipiscing elit"),
					li("Lorem ipsum dolor sit amet, consectetur adipiscing elit")
				),
				ol(
					li(
						p("Lorem ipsum dolor sit amet, consectetur adipiscing elit"),
						ol(
							li("Lorem ipsum dolor sit amet, consectetur adipiscing elit"),
							li("Lorem ipsum dolor sit amet, consectetur adipiscing elit")
						)
					),
					li("Lorem ipsum dolor sit amet, consectetur adipiscing elit")
				),
				p("LoLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed feugiat aliquet massa," +
					" quis vulputate diam. Morbi non dolor ac tellus finibus commodo. Donec convallis" +
					" tortor felis, et sodales quam vulputate ac.")
			),
			p("Lorem ipsum dolor sit amet, consectetur adipiscing elit." +
				" Etiam vestibulum dui mi, nec ultrices diam ultricies id. "),
			ul({ class: 'user-guide-costs-list' },
				li(span("Registration fee"), " ",
					span("$50'000")),
				li(span("Stamp duty for registration"), " ",
					span("$10'000")),
				li(span("Filing fees for memorandum"), " ",
					span("$45'000")),
				li({ class: 'user-guide-total-costs' },
					span("Total Costs:"), " ",
					span("$105'000")),
				li(span("Filing fees for memorandum"), " ",
					span("$45'000")),
					small("Lorem ipsum dolor sit amet, consectetur adipiscing elit.")),
			p(
				a({ class: 'button-resource-link', href: 'costs-print/' },
					span({ class: 'fa fa-print' }), " ",
					"Print costs list"
					)
			)
			),
		p({ class: 'user-next-step-button' },
			button({ type: 'submit' },
				"Save and continue"))
	);
	reqRadio._dbjsInput.listItems[0].appendChild(
		div({ class: 'disabler-range' }, // add 'disabler-active' class to disable ul
			ul(
				li(label({ class: 'input-aside' },
					input({ dbjs: user._isARequested, type: 'checkbox' }), " ",
					span(user.getDescriptor('isBRequested').label))),
				li(label({ class: 'input-aside' },
					input({ dbjs: user._isARequested,
						type: 'checkbox', value: 'checked' }), " ",
					span(user.getDescriptor('isBRequested').label)))
			),
			div({ class: 'disabler' }))
	);
};
