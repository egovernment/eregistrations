'use strict';

var db = require('mano').db
  , user = db.User.prototype;

module.exports = modal(
	{ class: 'modal-reset-password' },
	header(
		h3("Reset password")
	),
	section(
		{ class: 'modal-body' },
		form(
			{ id: 'reset-password-form', method: 'post' },
			p(input({ dbjs: db.Email, required: true, name: 'email',
				placeholder: user.getDescriptor('email').label })),
			p(input({ type: 'submit', value: "Reset" }))
		)
	)
);
