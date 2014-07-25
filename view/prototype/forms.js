'use strict';

var db = require('mano').db,
	user = db.User.prototype;

exports.step = function () {
	section(
		{ 'class': 'user-form' },
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
		form({ 'class': 'user-form' },
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
		div(
			{ 'class': 'partners' },
			h2("Section C"),
			div(
				h3("Directors & non-directors owner / partners"),
				hr(),
				table(
					{ 'class': 'partners-list' },
					thead(
						tr(
							th("Entity"),
							th("First name"),
							th("Surname"),
							th("Director?"),
							th("Subscriber?"),
							th("?"),
							th("Actions")
						)
					),
					tbody(
						tr(
							td("NA"),
							td("Lorem"),
							td("Ipsum"),
							td("Yes"),
							td("Yes"),
							td("✓"),
							td("Edit Delete")
						),
						tr(
							td("NA"),
							td("Lorem"),
							td("Ipsum"),
							td("Yes"),
							td("Yes"),
							td("✓"),
							td("Edit Delete")
						),
						tr(
							td("NA"),
							td("Lorem"),
							td("Ipsum"),
							td("Yes"),
							td("Yes"),
							td("✓"),
							td("Edit Delete")
						),
						tr(
							td("NA"),
							td("Lorem"),
							td("Ipsum"),
							td("Yes"),
							td("Yes"),
							td("✓"),
							td("Edit Delete")
						),
						tr(
							td("NA"),
							td("Lorem"),
							td("Ipsum"),
							td("Yes"),
							td("Yes"),
							td("✓"),
							td("Edit Delete")
						)
					)
				),
				a(
					{ 'class': 'new-partner' },
					"Add new partner"
				)
			)
		)
	);

	div({ 'class': 'next-step', 'href': '#' },
		a("Continue to next step")
		);
};
