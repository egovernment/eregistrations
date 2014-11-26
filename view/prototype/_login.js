'use strict';

var db = require('mano').db,
		user = db.User.prototype,
		registerLink,
		resetPasswordLink;

module.exports = modal(
	{ class: 'dialog-login' },
	header(
		h3("Login")
	),
	section(
		{ class: 'dialog-body' },
		form(
			{ id: 'login-form', method: 'post', action: '/login/' },
			ul(
				{ class: 'form-elements' },
				li({ class: 'dbjs-input-component input' },
					input({ dbjs: db.Email, required: true, name: 'email',
						placeholder: user.getDescriptor('email').label })),
				li({ class: 'dbjs-input-component input' }, input({ dbjs: db.Password,
					required: true, name: 'password', placeholder: user.getDescriptor('password').label }),
					span({ class: 'error-message' }, "Email or password is not recognized")
					)
			),
			p(input({ type: 'submit', value: "Sign In" }))
		)
	),
	footer(
		p("No account? ",
			registerLink = a(" Create an account"),
			span(" | "),
			resetPasswordLink = a(" Reset password"))
	)
);

registerLink.castAttribute('onclick', require('./_register').show);
resetPasswordLink.castAttribute('onclick', require('./_reset-password-request').show);
