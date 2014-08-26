'use strict';

var db = require('mano').db
  , user = db.User.prototype
  , registerLink;

module.exports = modal(
	{ class: 'modal-login' },
	section(
		header(
			h3("Login")
		),
		div(
			form(
				{ id: 'login-form', method: 'post', action: '/login/' },
				p(input({ dbjs: db.Email, required: true, name: 'email',
					placeholder: user.getDescriptor('email').label })),
				p(input({ dbjs: db.Password,
					required: true, name: 'password', placeholder: user.getDescriptor('password').label })),
				p({ class: 'error-message' }, "Email or password is not recognized"),
				p(input({ type: 'submit', value: "Sign In" }))
			)
		),
		footer(
			p("No account?",
				registerLink = a(" Create an account  | "),
				a({ href: '/reset-password/' }, " Reset password"))
		)
	)
);

registerLink.castAttribute('onclick', require('./_register').show);
