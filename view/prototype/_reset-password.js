'use strict';

var db = require('mano').db
  , user = db.User.prototype;

module.exports = modal(
	{ class: 'modal-reset-password' },
	section(
		header(
			h3("Reset password")
		),
		div(
			form(
				{ id: 'reset-password-form', method: 'post' },
				p(input({ dbjs: db.Email, required: true, name: 'email',
					placeholder: user.getDescriptor('email').label })),
				p(input({ type: 'submit', value: "Reset" }))
			)
		)
	)
);
