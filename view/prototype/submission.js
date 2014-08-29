'use strict';

var db = require('mano').db,
	user = db.User.prototype;

exports.step = function () {
	section({ class: 'section-primary' },
		h1("5 Send your file"),
		div(h2("Where do you want to withdraw your documents?"),
			hr(),
			form(ul({ class: 'form-elements fieldset' },
					['placeOfWithdraw'],
					function (name) { return field({ dbjs: user.getObservable(name) }); }
					)
				),
			p({ class: 'submit-placeholder' }, input({ type: 'submit' }, "Save"))
			)
		);

	section(
		{ class: 'section-primary' },
		div(h2("Who will pick the certificates?"),
			hr(),
			form(ul({ class: 'form-elements fieldset' },
				['pickCertificates', 'lastName', 'dateOfBirth', 'inventory'],
					function (name) { return field({ dbjs: user.getObservable(name) }); }
					),
				p({ class: 'submit-placeholder' }, input({ type: 'submit' }, "Save"))
				)
			)
	);

	section(
		{ class: 'section-warning' },
		ul(
			li(
				a({ class: 'form-complition-link', href: '/forms/' },
					"Some required fields in the tab Fill the form have not been completed"
					)
			),
			li(
				a({ class: 'form-complition-link', href: '/documents/' },
					"Some documents have not been uploaded"
					)
			)
		)
	);

	section(
		{ class: 'section-primary' },
		form(
			div(
				{ class: 'user-submission-sworn-declaration' },
				h2("Sworn declaration"),
				hr(),
				field(
					{ dbjs: user._isAffidavitSigned,
						type: 'checkbox',
						label: " I declare I have read and understood all the conditions I have to " +
						"comply with and swear that the information provided in this application is true.",
						render: function (input, options) {
							return label(input, " ", options.label,
									span({ class: 'required-status' }, '*'),
									span({ class: 'validation-status' }, '✓')
									);
						}
						}
				)
			)
		)
	);

	div({ class: 'submit-user-button' },
		a({ href: ' ' }, "Send Your files")
		);
};
