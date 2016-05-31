'use strict';

var db   = require('mano').db
  , user = db.User.prototype;

module.exports = exports = require('../../view/business-process-official-form');

exports._officialForm = function () {
	return div(
		{ class: 'section-primary official-form', id: 'certificates' },
		h3("Delivery of registrations"),
		h4("I certify to have seen the original of the following documents:"),
		form(
			{ method: 'post' },
			ul(
				{ class: 'front-desk-validation' },
				li(
					fieldset(
						ul(
							{ class: 'front-desk-validation-document' },
							li(
								label({ class: 'input-aside' },
									input({ dbjs: user._isARequested, type: 'checkbox' }), " ",
									span(user.getDescriptor('isBRequested').label))
							),
							li(
								div(
									{ class: 'input' },
									input({ dbjs: user._registeredArticlesFile })
								)
							)
						)
					)
				),
				li(
					fieldset(
						ul(
							{ class: 'front-desk-validation-document' },
							li(
								label({ class: 'input-aside' },
									input({ dbjs: user._isARequested, type: 'checkbox' }), " ",
									span(user.getDescriptor('isBRequested').label))
							),
							li(
								div(
									{ class: 'input' },
									input({ dbjs: user._registeredArticlesFile })
								)
							)
						)
					)
				),
				li(
					fieldset(
						ul(
							{ class: 'front-desk-validation-document' },
							li(
								label({ class: 'input-aside' },
									input({ dbjs: user._isARequested, type: 'checkbox' }), " ",
									span(user.getDescriptor('isBRequested').label))
							),
							li(
								div(
									{ class: 'input' },
									input({ dbjs: user._registeredArticlesFile })
								)
							)
						)
					)
				),
				li(
					fieldset(
						ul(
							{ class: 'front-desk-validation-document' },
							li(
								label({ class: 'input-aside' },
									input({ dbjs: user._isARequested, type: 'checkbox' }), " ",
									span(user.getDescriptor('isBRequested').label))
							),
							li(
								div(
									{ class: 'input' },
									input({ dbjs: user._registeredArticlesFile })
								)
							)
						)
					)
				)
			)
		),
		h4(
			span({ class: 'fa fa-print' }, "Print"),
			" ",
			"Print following certificates:"
		),
		ul(
			{ class: 'front-desk-certificates-print' },
			li(
				a(
					user.getDescriptor('incorporationCertificateFile').label
				)
			),
			li(
				a(
					user.getDescriptor('registeredArticlesFile').label
				)
			)
		),
		form(
			{ class: 'front-desk-confirmations' },
			h4(
				"I certify that I have delivered the following registrations and " +
					"uploaded a digital copy of them:"
			),
			ul(
				li(label({ class: 'input-aside' },
					input({ dbjs: user._isARequested, type: 'checkbox' }), " ",
					span(user.getDescriptor('isBRequested').label))),
				li(label({ class: 'input-aside' },
					input({ dbjs: user._isARequested, type: 'checkbox' }), " ",
					span(user.getDescriptor('isARequested').label)))
			)
		),
		form(
			{ class: 'official-form-upload' },
			ul(
				li(input({ dbjs: user._incorporationCertificateFile })),
				li(input({ dbjs: user._registeredArticlesFile }))
			)
		),
		p(
			{ class: 'official-submission-toolbar' },
			postButton(
				{ value: "Hold registrations", buttonClass: 'button-main' }
			),
			postButton(
				{ value: "Approve registrations", buttonClass: 'button-main' }
			)
		)
	);
};
