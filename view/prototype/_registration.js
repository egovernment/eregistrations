'use strict';

var db = require('mano').db
  , user = db.User.prototype;

exports['official-form'] =
		{ href: '/registration/user-id/',
		'': function () { insert('Registerations for approval'); }
		};

exports.certificates = function () {

	h3("Registerations for approval");
	hr();
	p("I certify to have seen the original of the following documents:");

	form(
		{ method: 'post', class: 'registration-form' },
		ul(
			li(
				fieldset(
					ul(
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
		),
		hr(),
		p(
			a(
				{ class: 'button-main' },
				span({ class: 'fa fa-print' }, "Print"),
				"Print certificate"
			)
		),
		hr(),
		fieldset(
			{ class: 'registrations-confirmations' },
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
		),
		hr(),
		p("Upload here the certificates:"),
		fieldset(
			{ class: 'official-form-upload' },
			input({ dbjs: user._incorporationCertificateFile }),
			input({ dbjs: user._registeredArticlesFile })
		),
		hr(),
		p(
			{ class: 'official-submission-toolbar' },
			input(
				{ type: 'submit', value: "Pause certification", class: 'button-main' }
			),
			input(
				{ type: 'submit', value: "Sign certificate", class: 'button-main' }
			)
		)
	);
};
