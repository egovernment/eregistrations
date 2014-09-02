'use strict';

var db = require('mano').db,
		user = db.User.prototype;

module.exports = modal(
	{ class: 'modal-inventory' },
	section(
		header(
			h3("Create your account")
		),
		div(
			form({ action: '/register/', method: 'post' })
		),
		footer(
			p()
		)
	)
);
