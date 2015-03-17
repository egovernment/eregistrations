'use strict';

var db = require('mano').db
  , user = db.User.prototype;

module.exports = dialog(
	{ id: 'reset-password', class: 'dialog-reset-password dialog-modal' },
	header(
		h3("Reset password")
	),
	section(
		{ class: 'dialog-body' },
		form(
			{ id: 'reset-password-form', method: 'post' },
			p({ class: 'success-message' },
				"Password reset email has been sent."),
			p(input({ dbjs: db.Email, required: true, name: 'email',
				placeholder: user.getDescriptor('email').label })),
			p(input({ type: 'submit', value: "Reset" }))
		)
	)
);
