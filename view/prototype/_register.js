'use strict';

var db = require('mano').db,
		user = db.User.prototype,
		loginLink;

module.exports = modal(
	{ class: 'modal-register' },
	section(
		header(
			h3("Create your account")
		),
		div(
			form({ action: '/register/', method: 'post' },
				fieldset(['firstName', 'lastName', 'email', 'password'].map(function (name) {
					var rel = user._get(name);
					return p(input({ dbjs: rel, placeholder: rel.descriptor.label }),
						span({ class: 'error-message' }, "Error message"));
				}),
					p({ class: 'error-message' },
						"Your password must be at least 6 characters and include at least one number."),
					p(
						label(
							input(
								{ dbjs: user._isManager, type: 'checkbox' }
							),
							span(user.getDescriptor('isManager').label)
						)
					),
					p("Manager account allows you to create multiple requests on behalf of others."),
					p(input({ type: 'submit', value: "Create account" }))))
		),
		footer(
			p("Already has account? ",
				loginLink = a("Log in"),
				span(" | "),
				a(" Reset password"))
		)
	)
);

loginLink.castAttribute('onclick', require('./_login').show);
