'use strict';

var db = require('mano').db,
	user = db.User.prototype,
	rejectModal,
	hideBtn;

module.exports = rejectModal = modal(
	{ class: 'modal-reject' },
	section(
		header(
			h3("Reason for rejection")
		),
		div(
			form(
				ul(
					{ class: 'form-elements' },
					li(
						{ class: 'input' },
						textarea({ dbjs: user.rejectReason })
					)
				),
				p(
					input({ type: 'submit', value: "Reject" })
				)

			)
		),
		footer(
			p(
				hideBtn = a('Close')
			)
		)
	)
);
hideBtn.castAttribute('onclick', rejectModal.hide);
