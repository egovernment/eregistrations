'use strict';

var db = require('mano').db,
	user = db.User.prototype;

exports.step = function () {
	div({ class: 'section-primary' }, h1("2 Fill the form"));
	div(
		{ class: 'disabler-range', id: 'forms-disabler-range' },
		section(
			form({ class: 'section-primary' },
				fieldset(h2("Busieness Owner basic informations"),
					hr(),
					ul({ class: 'form-elements fieldset' },
						['firstName', 'lastName', 'dateOfBirth', 'userEmail'],
						function (name) { return field({ dbjs: user.getObservable(name) }); }
						),
					p({ class: 'submit-placeholder' },
						input({ type: 'submit' }, "Submit")
						)
					)
				)
		),

		section(
			form({ class: 'section-primary' },
				fieldset(h2("Busieness Owner secondary informations"),
					hr(),
					ul({ class: 'form-elements fieldset' },
						['companyType', 'members', 'inventory', 'surfaceArea', 'isOwner', 'businessActivity',
							'registerIds'],
						function (name) { return field({ dbjs: user.getObservable(name) }); }
						),
					p({ class: 'submit-placeholder' },
						input({ type: 'submit' }, "Submit")
						)
					)
				)
		),

		section({ class: 'section-primary' },
			div(
				div(
					h2("Directors & non-directors owner / partners"),
					hr(),
					table(
						{ class: 'partners-list' },
						thead(
							tr(
								th({ class: 'desktop-only' }, "Entity"),
								th("First name"),
								th("Surname"),
								th({ class: 'desktop-only' }, "Director?"),
								th({ class: 'desktop-only' }, "Subscriber?"),
								th({ class: 'desktop-only' }, ""),
								th({ class: 'actions' }, "Actions")
							)
						),
						tbody(
							tr(
								td({ class: 'desktop-only' },
									a({ href: '/forms/partner-id/' }, "Lorem")
									),
								td(a({ href: '/forms/partner-id/' }, "John")),
								td(a({ href: '/forms/partner-id/' }, "Watson")),
								td({ class: 'desktop-only' }, a({ href: '/forms/partner-id/' }, "Yes")),
								td({ class: 'desktop-only' }, a({ href: '/forms/partner-id/' }, "Yes")),
								td({ class: 'desktop-only confirmed' }, "✓"),
								td({ class: 'actions' },
									a("Edit"),
									a("Delete")
									)
							),
							tr(
								td({ class: 'desktop-only' },
									a({ href: '/forms/partner-id/' }, "Lorem")
									),
								td(a({ href: '/forms/partner-id/' }, "John")),
								td(a({ href: '/forms/partner-id/' }, "Watson")),
								td({ class: 'desktop-only' }, a({ href: '/forms/partner-id/' }, "Yes")),
								td({ class: 'desktop-only' }, a({ href: '/forms/partner-id/' }, "Yes")),
								td({ class: 'desktop-only confirmed' }, "✓"),
								td({ class: 'actions' },
									a("Edit"),
									a("Delete")
									)
							),
							tr(
								td({ class: 'desktop-only' },
									a({ href: '/forms/partner-id/' }, "Lorem")
									),
								td(a({ href: '/forms/partner-id/' }, "John")),
								td(a({ href: '/forms/partner-id/' }, "Watson")),
								td({ class: 'desktop-only' }, a({ href: '/forms/partner-id/' }, "Yes")),
								td({ class: 'desktop-only' }, a({ href: '/forms/partner-id/' }, "Yes")),
								td({ class: 'desktop-only confirmed' }, "✓"),
								td({ class: 'actions' },
									a("Edit"),
									a("Delete")
									)
							),
							tr(
								td({ class: 'desktop-only' },
									a({ href: '/forms/partner-id/' }, "Lorem")
									),
								td(a({ href: '/forms/partner-id/' }, "John")),
								td(a({ href: '/forms/partner-id/' }, "Watson")),
								td({ class: 'desktop-only' }, a({ href: '/forms/partner-id/' }, "Yes")),
								td({ class: 'desktop-only' }, a({ href: '/forms/partner-id/' }, "Yes")),
								td({ class: 'desktop-only confirmed' }, "✓"),
								td({ class: 'actions' },
									a("Edit"),
									a("Delete")
									)
							),
							tr(
								td({ class: 'desktop-only' },
									a({ href: '/forms/partner-id/' }, "Lorem")
									),
								td(a({ href: '/forms/partner-id/' }, "John")),
								td(a({ href: '/forms/partner-id/' }, "Watson")),
								td({ class: 'desktop-only' }, a({ href: '/forms/partner-id/' }, "Yes")),
								td({ class: 'desktop-only' }, a({ href: '/forms/partner-id/' }, "Yes")),
								td({ class: 'desktop-only confirmed' }, "✓"),
								td({ class: 'actions' },
									a("Edit"),
									a("Delete")
									)
							)
						)
					),
					a(
						{ class: 'new-entity', href: '/forms/partner-add/' },
						"Add new partner"
					)
				)
			)
			),

		div({ class: 'next-step' },
			a({ href: '/documents/' }, "Continue to next step")
			),
		div({ class: 'disabler' })
	);
};
