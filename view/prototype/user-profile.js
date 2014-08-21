'use strict';

var db = require('mano').db,
	user = db.User.prototype;

exports.main = function () {
	div(
		{ class: 'section-primary' },
		h2("User Profile")
	);
	div(
		{ class: 'disabler-range', id: 'forms-disabler-range' },
		section(
			form(
				{ class: 'section-primary' },
				fieldset(
					h3("Basic informations"),
					hr(),
					ul(
						{ class: 'form-elements fieldset' },
						['firstName', 'lastName', 'userEmail', 'password'],
						function (name) {
							return field({ dbjs: user.getObservable(name) });
						}
					),
					p(
						{ class: 'submit-placeholder' },
						input(
							{ type: 'submit' },
							"Save"
						)
					)
				)
			)
		)
	);
};
