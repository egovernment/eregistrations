'use strict';

var db = require('mano').db

  , user = db.User.prototype;

module.exports = dialog(
	{ id: 'reject', class: 'dialog-reject dialog-modal' },
	header(
		label({ for: 'reject-reason' }, h3("Reason for rejection"))
	),
	section(
		{ class: 'dialog-body' },
		form(
			p(
				{ class: 'input' },
				textarea({ id: 'reject-reason', dbjs: user.rejectReason })
			),
			p(
				input({ type: 'submit', value: "Reject" })
			)
		)
	),
	footer(
		p(
			a({ href: '' }, 'Cancel')
		)
	)
);
