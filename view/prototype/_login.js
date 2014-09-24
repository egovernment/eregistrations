'use strict';

var db = require('mano').db,
		user = db.User.prototype,
		registerLink,
		resetPasswordLink;

module.exports = modal(
	{ class: 'modal-login' },
	section(
		header(
			h3("Login")
		),
		div(
			form(
				{ class: 'form-elements', id: 'login-form', method: 'post', action: '/login/' },
				div({ class: 'dbjs-input-component' }, input({ dbjs: db.Email, required: true, name: 'email',
					placeholder: user.getDescriptor('email').label })),
				div({ class: 'dbjs-input-component' }, input({ dbjs: db.Password,
					required: true, name: 'password', placeholder: user.getDescriptor('password').label })),
				p({ class: 'error-message' }, "Email or password is not recognized"),
				p(input({ type: 'submit', value: "Sign In" }))
			)
		),
		footer(
			p("No account? ",
				registerLink = a(" Create an account"),
				span(" | "),
				resetPasswordLink = a(" Reset password"))
		)
	)
);

registerLink.castAttribute('onclick', require('./_register').show);
resetPasswordLink.castAttribute('onclick', require('./_reset-password-request').show);
