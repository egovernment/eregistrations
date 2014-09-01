'use strict';

var db = require('mano').db,
	user = db.User.prototype,
	reqRadio;

exports.step = function () {
	section({ class: 'user-guide' },
			h1({ class: 'main-intro' },
				"1. Individual registration guide for companies"
			),
			form({ class: 'guide-form' },
				div({ class: 'guide-box' }, h2("Questions"),
					hr(),
					ul({ class: 'form-elements' },
					['businessActivity', 'isOwner', 'inventory', 'surfaceArea', 'members',
						'companyType', 'isShoppingGallery'], function (name) {
						li(div({ class: 'dbjs-input-component' },
							label(user.getDescriptor(name).label, ":"),
							div({ class: 'control' }, input({ dbjs: user.getObservable(name) }))));
					})),
				div({ class: 'guide-box' }, h2("Registrations"),
					hr(),
					ul(li(label({ class: 'input-aside' },
							input({ dbjs: user._isARequested, type: 'checkbox' }), " ",
						span(user.getDescriptor('isARequested').label))),
						li(label({ class: 'input-aside' },
							input({ dbjs: user._isARequested, type: 'checkbox' }), " ",
						span(user.getDescriptor('isBRequested').label))),
						li(label({ class: 'input-aside' },
							input({ dbjs: user._isARequested, type: 'checkbox' }), " ",
						span(user.getDescriptor('isARequested').label)))
					),
					p("Lorem ipsum dolor sit amet, consectetur adipiscing elit." +
						" Etiam vestibulum dui mi, nec ultrices diam ultricies id. " +
						" Etiam vestibulum dui mi, nec ultrices diam ultricies id. "),
					p("Lorem ipsum dolor sit amet, consectetur adipiscing elit." +
						" Etiam vestibulum dui mi, nec ultrices diam ultricies id. " +
						" Etiam vestibulum dui mi, nec ultrices diam ultricies id. ")
				),
				div({ class: 'guide-box' }, h2("Requirements"),
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
							li({ class: 'disabled' },
								label({ class: 'input-aside' }, input({ dbjs: user._isBRequested,
															type: 'checkbox',
															disabled: 'disabled',
															value: 'checked' }),
									" ",
									span(user.getDescriptor('isBRequested').label))),
							li(label({ class: 'input-aside' },
								input({ dbjs: user._isARequested, type: 'checkbox' }), " ",
								span(user.getDescriptor('isARequested').label))),
							li(label({ class: 'input-aside' },
								input({ dbjs: user._isARequested, type: 'checkbox' }), " ",
								span(user.getDescriptor('isBRequested').label)))
						)
					)
					)
				),
				div({ class: 'guide-box' }, h2("Costs"),
					hr(),
					p("Lorem ipsum dolor sit amet, consectetur adipiscing elit." +
						" Etiam vestibulum dui mi, nec ultrices diam ultricies id. "),
					ul({ class: 'guide-costs-list' },
						li(span("Registration fee"), " ",
							span("$50'000")
							),
						li(span("Stamp duty for registration"), " ",
							span("$10'000")),
						li(span("Filing fees for memorandum"), " ",
							span("$45'000")),
						li({ class: 'guide-total-costs' },
								span("Total Costs:"), " ",
								span("$105'000")
							)
						)
				),
				button({ class: 'save-step-one', type: 'submit' },
					"Save and continue"
				)
			)
		);
	reqRadio._dbjsInput.listItems[0].appendChild(
		div({ class: 'disabler-range' }, // add 'disabled' class to disable ul
			ul(
				li(label({ class: 'input-aside' },
					input({ dbjs: user._isARequested, type: 'checkbox' }), " ",
					span(user.getDescriptor('isBRequested').label))),
				li(label({ class: 'input-aside' },
					input({ dbjs: user._isARequested,
						type: 'checkbox', value: 'checked' }), " ",
					span(user.getDescriptor('isBRequested').label)))
			),
			div({ class: 'disabler' })
			)
	);
};
