'use strict';

var db  = require('mano').db,
		location = require('mano/lib/client/location'),
		user = db.User.prototype;

exports._parent = require('./base');

exports.main = function () {
	form(
		{ class: 'content user-forms' },
		div(
			{ class: 'section-primary' },
			h3("Reset Password"),
			ul(
				{ class: 'form-elements' },
				li(
					div(
						{ class: 'dbjs-input-component' },
						label({ for: 'input-email' }, user.$get('email').label, ":"),
						div(
							{ class: 'input' },
							input({ type: 'email', id: 'input-email', dbjs: db.Email, name: 'email' })
						)
					)
				),
				li(
					div(
						{ class: 'dbjs-input-component' },
						label({ for: 'input-password' }, "New password", ":"),
						div(
							{ class: 'input' },
							input({ type: 'password',
											id: 'input-password',
											dbjs: db.Password,
											name: 'password' }),
							span({ class: 'hint' }, "Password need to be at least 6 characters long.")
						)
					)
				),
				li(
					div(
						{ class: 'dbjs-input-component' },
						label({ for: 'input-password-repeat' }, "Repeat password", ":"),
						div(
							{ class: 'input' },
							input({ type: 'password',
											id: 'input-password-repeat',
											dbjs: db.Password,
											name: 'password' }),
							span({ class: 'hint' }, "Repeat new password here")
						)
					)
				),
				li(
					input({ type: 'hidden', name: 'password-token', value: location.query.get('token') })
				)
			),
			p(
				{ class: 'submit-placeholder input' },
				input({ type: 'submit' }),
				"  ",
				a({ class: 'button-regular', href: '/' }, "Cancel")
			)
		)
	);
};
