// Generic submission user page (Part A)

'use strict';

var generateSections = require('./components/generate-form-sections')
  , errorMsg = require('./_user-registration-error-info').errorMsg
  , _  = require('mano').i18n.bind('Registration');

exports._parent = require('./user-registration-base');

exports['step-submission'] = { class: { 'step-active': true } };

exports.step = function () {
	exports._submissionHeading();

	insert(errorMsg(this, exports._sentBackInformation));

	insert(generateSections(this.businessProcess.submissionForms.applicable));

	insert(_if(or(lt(this.businessProcess.dataForms._progress, 1),
			lt(this.businessProcess.requirementUploads._progress, 1),
			lt(this.businessProcess.submissionForms._progress, 1)), section(
		{ class: 'section-warning' },
		ul(
			_if(not(eq(this.businessProcess.dataForms._progress, 1)),
				li(a({ class: 'form-complition-link', href: '/forms/' },
					_("Some mandatory fields on tab 'Enter your details' have not been completed")))),
			_if(not(eq(this.businessProcess.requirementUploads._progress, 1)),
				li(a({ class: 'form-complition-link', href: '/documents/' },
					_("Some documents have not been uploaded")))),
			_if(not(eq(this.businessProcess.submissionForms._progress, 1)),
				li(a({ class: 'form-complition-link', onclick: 'window.scroll(0, 0)' },
					_("Some mandatory fields on tab 'Send' have not been completed"))))
		)
	)));

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
