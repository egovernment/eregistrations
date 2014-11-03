'use strict';

var db = require('mano').db,
	user = db.User.prototype;

module.exports = modal(
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
						input({ dbjs: user.rejectReason })
					)
				),
				p(
					input({ type: 'submit', value: "Reject" })
				)

			)
		),
		footer(
			a({ class: "close" }, 'X')
		)
	)
);
