'use strict';

var db = require('mano').db

  , user = db.User.prototype;

module.exports = dialog(
	{ id: 'register', class: 'dialog-register dialog-modal' },
	header(
		h3("Create your account")
	),
	section(
		{ class: 'dialog-body' },
		form({ action: '/register/', method: 'post' },
			ul({ class: 'form-elements' }, ['firstName', 'lastName', 'email', 'password'].map(
				function (name) {
					var rel = user._get(name);
					return li({ class: 'dbjs-input-component input' },
						label(span({ class: 'placeholder-fallback' }, rel.descriptor.label, ":"),
							input({ dbjs: rel, placeholder: rel.descriptor.label })),
						span({ class: 'error-message' }, "Error message"));
				}
			),
				li(
					{ class: 'dbjs-input-component input' },
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
			a({ href: '#login' }, "Log in"),
			span(" | "),
			a({ href: '#reset-password' }, " Reset password"))
	)
);
