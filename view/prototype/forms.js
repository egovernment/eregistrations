'use strict';

var db = require('mano').db,
	user = db.User.prototype;

exports.step = function () {
	div({ class: 'section-primary' }, h1("2 Fill the form"));
	div({ class: 'error-main' },
		p(span({ class: 'fa fa-exclamation-circle' }), "Please fill the Guide first"));
	div(
		{ class: 'disabler-range', id: 'forms-disabler-range' },
		section(
			form({ class: 'section-primary' },
				fieldset(h2("Business Owner basic informations"),
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

		section({ class: 'section-primary' },
			form(
				h2("Business Owner secondary informations"),
				hr(),
				fieldset({ class: 'sub-section' },
					h3("First subsection"),
					ul({ class: 'form-elements fieldset' },
						['companyType', 'members', 'inventory', 'surfaceArea', 'isOwner', 'businessActivity',
							'registerIds'],
						function (name) { return field({ dbjs: user.getObservable(name) }); }
						),
					p({ class: 'submit-placeholder' },
						input({ type: 'submit' }, "Submit")
						)
					),
				fieldset({ class: 'sub-section' },
					h3("Second subsection"),
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
