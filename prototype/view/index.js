'use strict';

var db = require('mano').db

  , user = db.User.prototype
  , login         = require('./_login')
  , register      = require('./_register')
  , resetPassword = require('./_reset-password-request');

exports._parent = require('./base');

exports.menu = function () {
	ul(
		{ class: 'header-top-menu' },
		li(a('en')),
		li(a('sw')),
		li(a('link one')),
		li(a('link two')),
		li(a({ onclick: '$(\'dialog-app-nav\').include()' }, 'nav dialog')),
		li({ class: 'header-top-login-inactive' },
			span({ class: 'header-top-login-hint' }, ('Do you have an account?')),
			a({ class: 'header-top-login', href: '#login' },
				"Log in"))
	);
};

exports.main = function () {
	insert(login);
	insert(register);
	insert(resetPassword);
	section(
		{ class: 'content user-forms' },
		div(
			{ class: 'section-primary section-sides public-login-register-section' },
			div(
				h3("Login"),
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
				p("Forgot password? ",
					a({ href: "#reset-password" }, "Reset password"))
			),
			div(
				h3("Create your account"),
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
				)
			)
		)
	);
};
