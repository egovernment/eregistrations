// Generic submission user page (Part A)

'use strict';

var db = require('mano').db
  , generateSections = require('./components/generate-form-sections')
  , user = db.User.prototype
  , errorMsg = require('./_user-registration-error-info').errorMsg;

exports._parent = require('./user-registration-base');

exports['step-submission'] = { class: { 'step-active': true } };

exports.step = function () {
	exports._submissionHeading();

	insert(errorMsg(this, exports._sentBackInformation));

	insert(generateSections(this.businessProcess.submissionForms.applicable));

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
				{ dbjs: this.businessProcess.submissionForms._isAffidavitSigned,
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
		div(button({ type: 'submit', class: 'user-submission-button' }, "Send Your files"))
	);

};

exports._submissionHeading = Function.prototype;
