'use strict';

var db = require('mano').db

  , user = db.User.prototype;

module.exports = dialog(
	{ id: 'login', class: 'dialog-login dialog-modal' },
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
			a({ href: '#register' }, "Create an account"),
			span(" | "),
			a({ href: "#reset-password" }, "Reset password"))
	)
);
