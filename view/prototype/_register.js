'use strict';

var db = require('mano').db,
		user = db.User.prototype,
		loginLink,
		resetPasswordLink;

module.exports = modal(
	{ class: 'modal-register' },
	section(
		header(
			h3("Create your account")
		),
		div(
			form({ action: '/register/', method: 'post' },
				ul({ class: 'form-elements' }, ['firstName', 'lastName', 'email', 'password'].map(
					function (name) {
						var rel = user._get(name);
						return li({ class: 'dbjs-input-component' },
							input({ dbjs: rel, placeholder: rel.descriptor.label }),
							span({ class: 'error-message' }, "Error message"));
					}
				),
					li(
						{ class: 'dbjs-input-component' },
						label(
							input(
								{ dbjs: user._isManager, type: 'checkbox' }
							),
							" ",
							span(user.getDescriptor('isManager').label)
						),
						span({ class: 'hint' },
							"Manager account allows you to create multiple requests on behalf of others.")
					)
					),
				p(input({ type: 'submit', value: "Create account" })))
		),
		footer(
			p("Already has account? ",
				loginLink = a("Log in"),
				span(" | "),
				resetPasswordLink = a(" Reset password"))
		)
	)
);

loginLink.castAttribute('onclick', require('./_login').show);
resetPasswordLink.castAttribute('onclick', require('./_reset-password-request').show);
