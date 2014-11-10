'use strict';

var db = require('mano').db
  , user = db.User.prototype;

exports['official-form'] =
		{ href: '/front-desk/user-id/',
		'': function () { insert("Delivery of registrations"); }
		};

exports.certificates = function () {

	h3("Delivery of registrations");
	hr();

	h4("I certify to have seen the original of the following documents:");

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
	);

	hr();

	p(
		span({ class: 'fa fa-print' }, "Print"),
		"Print certificate"
	);
	p(
		a(
			{ class: 'print-certificate-button' },
			user.getDescriptor('incorporationCertificateFile').label
		),
		a(
			{ class: 'print-certificate-button' },
			user.getDescriptor('registeredArticlesFile').label
		)
	);

	hr();
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
	);

	hr();

	form(
		{ class: 'official-form-upload' },
		input({ dbjs: user._incorporationCertificateFile }),
		input({ dbjs: user._registeredArticlesFile })
	);

	hr();

	p(
		{ class: 'official-submission-toolbar' },
		postButton(
			{ value: "Hold registrations", buttonClass: 'button-main' }
		),
		postButton(
			{ value: "Approve registrations", buttonClass: 'button-main' }
		)
	);

};
