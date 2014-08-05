'use strict';

var db = require('mano').db,
		user = db.User.prototype;

exports.step = function () {
	section({ 'class': 'section-primary' },
		form(h2("Section A"),
			fieldset(h3("Busieness Partner basic informations"),
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

	section({ 'class': 'section-primary' },
		form(h2("Section B"),
				fieldset(h3("Busieness Partner secondary informations"),
					hr(),
					ul({ 'class': 'form-elements forms' },
						['companyType', 'inventory', 'surfaceArea', 'isOwner', 'businessActivity'],
						function (name) { return field({ dbjs: user.getObservable(name) }); }
						),
					p({ 'class': 'submit-placeholder' },
						input({ 'type': 'submit' }, "Submit")
						)
					)
				)
		);

	div({ 'class': 'next-step' },
			a({ 'href': '/forms/' }, "Save")
			);
};
