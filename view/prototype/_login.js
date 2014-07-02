'use strict';

var register = require('./_register')

  , db = require('mano').db
  , user = db.User.prototype;

module.exports = modal(h4("Login"),
	form({ id: 'login-form', method: 'post', action: '/login/' },
		p(input({ class: "form-control", dbjs: db.Email, required: true, name: 'email',
			placeholder: user.$email.label })),
		p(input({  class: "form-control", dbjs: db.Password,
			required: true, name: 'password', placeholder: user.$password.label })),
		p("Email or password is not recognized"),
		p(input({ type: 'submit', value: "Sign In" })),
		p("No account?",
			a({ onclick: register.show }, " Create an account  | "),
			a({ href: '/reset-password/' }, " Reset password"))));
