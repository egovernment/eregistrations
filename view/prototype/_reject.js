'use strict';

var db = require('mano').db,
	user = db.User.prototype,
	rejectModal,
	hideBtn;

module.exports = rejectModal = modal(
	{ class: 'modal-reject' },
	section(
		header(
			label({ for: 'reject-reason' }, h3("Reason for rejection"))
		),
		div(
			form(
				textarea({ id: 'reject-reason', dbjs: user.rejectReason }),
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
	)
);
hideBtn.castAttribute('onclick', rejectModal.hide);
