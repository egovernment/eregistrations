'use strict';

var db = require('mano').db

  , user = db.User.prototype;

exports.main = function () {
	div({ 'class': 'steps-menu' },
		div({ 'class': 'all-menu-items' },
			label({ 'class': 'step-active show-steps-btn', 'for': 'show-steps-control' },
				'Steps'
				),
			input({ 'id': 'show-steps-control', 'type': 'checkbox', 'role': 'button' }
				),
			nav({ 'class': 'steps' },
				menuitem(
					a({ 'class': 'step-active' },
						"1. Guide"
						)
				),
				menuitem(
					a({ 'class': 'step-unactive' },
						"2. Fill the form"
						)
				),
				menuitem(
					a({ 'class': 'step-unactive' },
						"3. Upload docs"
						)
				),
				menuitem(
					a({ 'class': 'step-unactive' },
						"4. Pay"
						)
				),
				menuitem(
					a({ 'class': 'step-unactive' },
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
			form({ 'class': 'guide-form' },
				div(h3("Questions"),
					hr(),
					ul({ 'class': 'form-elements' }, li(label(user.getDescriptor('businessActivity').label,
						" ",
						input({ dbjs: user._businessActivity, property: 'label', group: {
						propertyName: 'category',
						labelPropertyName: 'label'
					} }))),
					list(['isOwner', 'inventory', 'surfaceArea', 'members',
						'companyType', 'isShoppingGallery'], function (name) {
						li(label(user.getDescriptor(name).label, " ",
							input({ dbjs: user.getObservable(name) })));
					}))),
				div(h3("Registrations"),
					hr(),
					p(label(input({ dbjs: user._isARequested, type: 'checkbox' }), " ",
						user.getDescriptor('isARequested').label)),
					p(label(input({ dbjs: user._isBRequested, type: 'checkbox' }), " ",
						user.getDescriptor('isBRequested').label)),
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
