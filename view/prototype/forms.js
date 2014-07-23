'use strict';

var db = require('mano').db,
	user = db.User.prototype;

exports.step = function () {
	section(
		{ 'class': 'user-form' },
		form(
			h2("Section A"),
			fieldset(
				h3("Busieness Owner basic informations"),
				hr(),
				ul(
					{ 'class': 'form-elements forms' },
					['firstName', 'lastName', 'dateOfBirth', 'userEmail'],
					function (name) {
						return field(
							{ dbjs: user.getObservable(name) }
						);
					}
				),
				p(
					input({ 'type': 'submit' }, "Submit")
				)
			)
		)
	);

	section(
		form(
			{ 'class': 'user-form' },
			h2("Section B"),
			fieldset(
				h3("Busieness Owner secondary informations"),
				hr(),
				ul(
					{ 'class': 'form-elements forms' },
					['companyType', 'members', 'inventory', 'surfaceArea', 'isOwner', 'businessActivity',
						'registerIds'],
					function (name) {
						return field(
							{ dbjs: user.getObservable(name) }
						);
					}
				),
				p(
					input({ 'type': 'submit' }, "Submit")
				)
			)
		)
	);
};
