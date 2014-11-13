'use strict';

var db = require('mano').db
  , inventory = require('./_inventory')

  , user = db.User.prototype
  , reqRadio;

exports['step-guide'] = { class: { 'step-active': true } };

exports.step = function () {
	h1("1. Individual registration guide for companies");
	insert(inventory);

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
					'isShoppingGallery'],
				function (name) {
					if (name === 'inventory') {
						li(div({ class: 'dbjs-input-component' },
							label({ for: 'input-' + name }, user.getDescriptor(name).label, ":"),
							div({ class: 'input' },
								input({ control: { id: 'input-' + name }, dbjs: user.getObservable(name) }))));
						div({ class: 'inventory-button' },
							a({ onclick: inventory.show },
								span({ class: 'fa fa-calculator icon' }, "Calculator"),
								span({ class: 'label' }, "Calculate the amount")));
					} else if (name === 'isShoppingGallery') {
						li(div({ class: 'dbjs-input-component' },
							label(
								{ for: 'input-' + name },
								"Is shopping gallery?"
							),
							div({ class: 'input' },
								input({ control: { id: 'input-' + name }, dbjs: user.getObservable(name),
									type: 'checkbox' }))));
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
				{ class: 'wrapper' },
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
			ul({ class: 'guide-requirements-list' },
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
			p("Lorem ipsum dolor sit amet, consectetur adipiscing elit." +
				" Etiam vestibulum dui mi, nec ultrices diam ultricies id. "),
			ul({ class: 'guide-costs-list' },
				li(span("Registration fee"), " ",
					span("$50'000")),
				li(span("Stamp duty for registration"), " ",
					span("$10'000")),
				li(span("Filing fees for memorandum"), " ",
					span("$45'000")),
				li({ class: 'guide-total-costs' },
					span("Total Costs:"), " ",
					span("$105'000")))),
		p(button({ class: 'save-step-one', type: 'submit' },
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
