'use strict';

var db = require('mano').db,
	user = db.User.prototype,
	rejectDialog,
	hideBtn;

module.exports = rejectDialog = modal(
	{ class: 'dialog-reject' },
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
			hideBtn = a('Cancel')
		)
	)
);
hideBtn.castAttribute('onclick', rejectDialog.hide);
