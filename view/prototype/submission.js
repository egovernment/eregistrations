'use strict';

var db = require('mano').db
  , user = db.User.prototype;

exports['step-submission'] = { class: { 'step-active': true } };

exports.step = function () {
	h1("5. Send your file");
	div({ class: 'section-primary' },
		h2("Where do you want to withdraw your documents?"),
		hr(),
		form(fieldset({ class: 'form-elements', dbjs: user, names: ['placeOfWithdraw'] })),
		p({ class: 'submit-placeholder input' }, input({ type: 'submit' }, "Save")));

	div({ class: 'section-primary' },
		h2("Who will pick the certificates?"),
		hr(),
		form(fieldset({ class: 'form-elements', dbjs: user, names: ['pickCertificates',
				'lastName', 'dateOfBirth', 'inventory'] }),
			p({ class: 'submit-placeholder input' }, input({ type: 'submit' }, "Save"))));

	section(
		{ class: 'section-warning' },
		ul(
			li(
				a({ class: 'form-complition-link', href: '/forms/' },
					"Some required fields in the tab Fill the form have not been completed")
			),
			li(
				a({ class: 'form-complition-link', href: '/documents/' },
					"Some documents have not been uploaded")
			)
		)
	);

	form(
		{ action: '/user-submitted/' },
		section(
			{ class: 'section-primary user-submission-sworn-declaration' },
			h2("Sworn declaration"),
			hr(),
			field(
				{ dbjs: user._isAffidavitSigned,
					type: 'checkbox',
					label: " I declare I have read and understood all the conditions I have to " +
					"comply with and swear that the information provided in this application is true.",
					render: function (input, options) {
						return label({ class: 'input-aside' },
							input,
							span(" ", options.label),
							span({ class: 'status-missing' }, '*'),
							span({ class: 'status-ok' }, '✓'),
							span({ class: 'status-error' }, '✕'));
					} }
			)
		),
		div({ class: 'next-step' },
			button({ type: 'submit', class: 'submit-user-button' }, "Send Your files"))
	);

};
