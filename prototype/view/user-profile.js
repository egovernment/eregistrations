'use strict';

var db = require('mano').db,
	user = db.User.prototype;

exports._parent = require('./_user-main');

exports['sub-main'] = function () {
	div(
		{ class: 'content user-forms' },
		h1("User Profile"),
		div(
			{ class: 'disabler-range', id: 'forms-disabler-range' },
			section(
				form(
					fieldset(
						{ class: 'section-primary' },
						h3("Basic informations"),
						hr(),
						ul(
							{ class: 'form-elements' },
							['firstName', 'lastName', 'userEmail', 'password'],
							function (name) {
								return field({ dbjs: user.getObservable(name) });
							}
						),
						p(
							{ class: 'dbjs-component-message success-message' },
							"Profile has been successfully updated."
						),
						p(
							{ class: 'submit-placeholder input' },
							input(
								{ type: 'submit' },
								"Save"
							)
						)
					)
				)
			)
		)
	);
};
