'use strict';

var db = require('mano').db,
	user = db.User.prototype;

exports.step = function () {
	section(
		{ 'class': 'section-primary' },
		form(h2("Section A"),
			fieldset(h3("Busieness Owner basic informations"),
				hr(),
				ul({ 'class': 'form-elements forms' },
					['firstName', 'lastName', 'dateOfBirth', 'userEmail'],
					function (name) { return field({ dbjs: user.getObservable(name) }); }
					),
				p({ 'class': 'submit-placeholder' },
					input({ 'type': 'submit' }, "Submit")
					)
				)
			)
	);

	section(
		form({ 'class': 'section-primary' },
			h2("Section B"),
			fieldset(h3("Busieness Owner secondary informations"),
				hr(),
				ul({ 'class': 'form-elements forms' },
					['companyType', 'members', 'inventory', 'surfaceArea', 'isOwner', 'businessActivity',
						'registerIds'],
					function (name) { return field({ dbjs: user.getObservable(name) }); }
					),
				p({ 'class': 'submit-placeholder' },
					input({ 'type': 'submit' }, "Submit")
					)
				)
			)
	);

	section(
		{ 'class': 'section-primary' },
		div(
			h2("Section C"),
			div(
				h3("Directors & non-directors owner / partners"),
				hr(),
				table(
					{ 'class': 'partners-list' },
					thead(
						tr(
							th({ 'class': 'desktop-only' }, "Entity"),
							th("First name"),
							th("Surname"),
							th({ 'class': 'desktop-only' }, "Director?"),
							th({ 'class': 'desktop-only' }, "Subscriber?"),
							th({ 'class': 'desktop-only' }, ""),
							th("Actions")
						)
					),
					tbody(
						tr(
							td({ 'class': 'desktop-only' },
								a({ 'href': '/forms/partner-id' }, "Lorem")
								),
							td(a({ 'href': '/forms/partner-id' }, "Ipsum")),
							td(a({ 'href': '/forms/partner-id' }, "Dor Sit")),
							td({ 'class': 'desktop-only' }, a({ 'href': '/forms/partner-id' }, "Yes")),
							td({ 'class': 'desktop-only' }, a({ 'href': '/forms/partner-id' }, "Yes")),
							td({ 'class': 'desktop-only' }, "✓"),
							td({ 'class': 'actions' },
								a({ 'href': '#' }, "Edit"),
								a({ 'href': '#' }, "Delete")
								)
						),
						tr(
							td({ 'class': 'desktop-only' },
								a({ 'href': '/forms/partner-id' }, "Lorem")
								),
							td(a({ 'href': '/forms/partner-id' }, "Ipsum")),
							td(a({ 'href': '/forms/partner-id' }, "Dor Sit")),
							td({ 'class': 'desktop-only' }, a({ 'href': '/forms/partner-id' }, "Yes")),
							td({ 'class': 'desktop-only' }, a({ 'href': '/forms/partner-id' }, "Yes")),
							td({ 'class': 'desktop-only' }, "✓"),
							td({ 'class': 'actions' },
								a({ 'href': '#' }, "Edit"),
								a({ 'href': '#' }, "Delete")
								)
						),
						tr(
							td({ 'class': 'desktop-only' },
								a({ 'href': '/forms/partner-id' }, "Lorem")
								),
							td(a({ 'href': '/forms/partner-id' }, "Ipsum")),
							td(a({ 'href': '/forms/partner-id' }, "Dor Sit")),
							td({ 'class': 'desktop-only' }, a({ 'href': '/forms/partner-id' }, "Yes")),
							td({ 'class': 'desktop-only' }, a({ 'href': '/forms/partner-id' }, "Yes")),
							td({ 'class': 'desktop-only' }, "✓"),
							td({ 'class': 'actions' },
								a({ 'href': '#' }, "Edit"),
								a({ 'href': '#' }, "Delete")
								)
						),
						tr(
							td({ 'class': 'desktop-only' },
								a({ 'href': '/forms/partner-id' }, "Lorem")
								),
							td(a({ 'href': '/forms/partner-id' }, "Ipsum")),
							td(a({ 'href': '/forms/partner-id' }, "Dor Sit")),
							td({ 'class': 'desktop-only' }, a({ 'href': '/forms/partner-id' }, "Yes")),
							td({ 'class': 'desktop-only' }, a({ 'href': '/forms/partner-id' }, "Yes")),
							td({ 'class': 'desktop-only' }, "✓"),
							td({ 'class': 'actions' },
								a({ 'href': '#' }, "Edit"),
								a({ 'href': '#' }, "Delete")
								)
						),
						tr(
							td({ 'class': 'desktop-only' },
								a({ 'href': '/forms/partner-id' }, "Lorem")
								),
							td(a({ 'href': '/forms/partner-id' }, "Ipsum")),
							td(a({ 'href': '/forms/partner-id' }, "Dor Sit")),
							td({ 'class': 'desktop-only' }, a({ 'href': '/forms/partner-id' }, "Yes")),
							td({ 'class': 'desktop-only' }, a({ 'href': '/forms/partner-id' }, "Yes")),
							td({ 'class': 'desktop-only' }, "✓"),
							td({ 'class': 'actions' },
								a({ 'href': '#' }, "Edit"),
								a({ 'href': '#' }, "Delete")
								)
						)
					)
				),
				a(
					{ 'class': 'new-partner', 'href': '/forms/partner-add' },
					"Add new partner"
				)
			)
		)
	);

	div({ 'class': 'next-step', 'href': '#' },
		a("Continue to next step")
		);
};
