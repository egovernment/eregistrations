'use strict';

var db = require('mano').db

  , user = db.User.prototype
  , login         = require('./_login')
  , register      = require('./_register')
  , resetPassword = require('./_reset-password-request');

exports.main = function () {
	insert(login);
	insert(register);
	insert(resetPassword);
	section(
		{ class: 'content user-forms' },
		div(
			{ class: 'section-primary section-sides' },
			div(
				h3("Login"),
				hr(),
				form(
					ul({ class: 'form-elements' },
						['email', 'password'],
						function (name) {
							li(div({ class: 'dbjs-input-component' },
								label(
									{ for: 'input-' + name },
									user.getDescriptor(name).label,
									":"
								),
								div({ class: 'input' },
									input({ control: { id: 'input-' + name }, dbjs: user.getObservable(name) }))));
						}
						),
					p({ class: 'submit-placeholder' }, input({ type: 'submit', value: "Sign In" }))
				),
				hr(),
				p("Forgot password? ",
					a({ href: "#reset-password" }, "Reset password"))
			),
			div(
				h3("Create your account"),
				hr(),
				form(
					ul({ class: 'form-elements' },
						['firstName', 'lastName', 'email', 'password'],
						function (name) {
							li(div({ class: 'dbjs-input-component' },
								label(
									{ for: 'input-' + name },
									user.getDescriptor(name).label,
									":"
								),
								div({ class: 'input' },
									input({ control: { id: 'input-' + name }, dbjs: user.getObservable(name) }))));
						}
						),
					p({ class: 'submit-placeholder' }, input({ type: 'submit', value: "Sign Up" }))
				),
				hr(),
				p("Already has account? Log in using form on left side")
			)
		)
	);
};
