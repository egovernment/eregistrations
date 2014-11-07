'use strict';

var db = require('mano').db
  , user = db.User.prototype;

exports['official-form'] =
		{ href: '/front-desk/user-id/',
		'': function () { insert('Registerations for approval'); }
		};

exports.certificates = function () {

	h3("Registerations for approval");
	hr();

	p("I certify to have seen the original of the following documents:");

	form(
		{ method: 'post' },
		ul(
			{ class: 'front-desk-uploaded-documents' },
			li(
				fieldset(
					ul(
						{ class: 'front-desk-uploaded-document' },
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
						{ class: 'front-desk-uploaded-document' },
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
						{ class: 'front-desk-uploaded-document' },
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
						{ class: 'front-desk-uploaded-document' },
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
		a(
			{ class: 'button-main' },
			span({ class: 'fa fa-print' }, "Print"),
			"Print certificate"
		)
	);

	hr();
	form(
		{ class: 'front-desk-confirmations' },
		p(
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

	p("Upload here the certificates:");
	form(
		{ class: 'official-form-upload' },
		input({ dbjs: user._incorporationCertificateFile }),
		input({ dbjs: user._registeredArticlesFile })
	);

	hr();

	p(
		{ class: 'official-submission-toolbar' },
		postButton(
			{ value: "Pause certification", buttonClass: 'button-main' }
		),
		postButton(
			{ value: "Sign certificate", buttonClass: 'button-main' }
		)
	);

};
