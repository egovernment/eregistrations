'use strict';

var db = require('mano').db,
	user = db.User.prototype;

exports['sub-main'] = function () {
	section(
		form(
			{ class: 'section-primary' },
			fieldset(
				h3("Add new user"),
				hr(),
				ul(
					{ 'class': 'form-elements fieldset' },
					['firstName', 'lastName', 'roles', 'userEmail', 'password'],
					function (name) {
						return field({ dbjs: user.getObservable(name) });
					}
				),
				p(
					{ 'class': 'submit-placeholder' },
					input(
						{ 'type': 'submit' },
						"Save"
					)
				)
			)
		)
	);
};
