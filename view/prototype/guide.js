'use strict';

var db = require('mano').db,
	user = db.User.prototype;

exports.step = function () {
	section({ 'class': 'user-guide' },
			h3({ 'class': 'main-intro' },
				"INDIVIDUAL REGISTRATION GUIDE FOR COMPANIES"),
			h3("Complete the previous questions, pick your records and" +
					"see the necessary documents and costs"
			),
			form({ 'class': 'guide-form' },
				div(h3("Questions"),
					hr(),
					ul({ 'class': 'form-elements' },
					['businessActivity', 'isOwner', 'inventory', 'surfaceArea', 'members',
						'companyType', 'isShoppingGallery'], function (name) {
						li(label(span({ 'class': 'label' }, user.getDescriptor(name).label), " ",
							input({ dbjs: user.getObservable(name) })));
					})),
				div(h3("Registrations"),
					hr(),
					ul({ 'class': 'form-elements' },
						li(label(input({ dbjs: user._isARequested, type: 'checkbox' }), " ",
						span(user.getDescriptor('isARequested').label))),
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
				div(h3("Requirements"),
					hr(),
					p("Lorem ipsum dolor sit amet, consectetur adipiscing elit." +
						" Etiam vestibulum dui mi, nec ultrices diam ultricies id. "),
					ul(li("Lorem ipsum dolor sit amet, consectetur adipiscing elit."),
						li("Lorem ipsum dolor sit amet, consectetur adipiscing elit."),
						li("Lorem ipsum dolor sit amet, consectetur adipiscing elit."),
						li("Lorem ipsum dolor sit amet, consectetur adipiscing elit."),
						li("Lorem ipsum dolor sit amet, consectetur adipiscing elit."))),
				div(h3("Costs"),
					hr(),
					p("Lorem ipsum dolor sit amet, consectetur adipiscing elit." +
						" Etiam vestibulum dui mi, nec ultrices diam ultricies id. "),
					h4({ 'class': 'guide-total-costs' },
						"Total Costs:"
						)
				),
				button({ 'class': 'save-step-one', 'type': 'submit' },
					"Save and continue"
				)
			)
		);
};
