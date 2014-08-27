'use strict';

var db = require('mano').db,
	user = db.User.prototype;

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
					ul({ class: 'form-elements' },
						li(label(input({ dbjs: user._isARequested, type: 'checkbox' }), " ",
						span(user.getDescriptor('isARequested').label))),
						li(label(input({ dbjs: user._isARequested, type: 'checkbox' }), " ",
						span(user.getDescriptor('isBRequested').label))),
						li(label(input({ dbjs: user._isARequested, type: 'checkbox' }), " ",
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
					ul(li("Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
						" Lorem ipsum dolor sit amet, consectetur adipiscing elit."),
						li("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum " +
							"dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet," +
							" consectetur adipiscing elit."),
						li("Lorem ipsum dolor sit amet, consectetur adipiscing elit."),
						li("Lorem ipsum dolor sit amet, consectetur adipiscing elit."),
						li("Lorem ipsum dolor sit amet, consectetur adipiscing elit."))),
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
};
