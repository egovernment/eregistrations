// Generic submission user page (Part A)

'use strict';

var generateSections = require('./components/generate-form-sections')
  , errorMsg         = require('./_business-process-error-info').errorMsg
  , _                = require('mano').i18n.bind('Registration');

exports._parent = require('./business-process-base');

exports['step-submission'] = { class: { 'step-active': true } };

exports.step = function () {
	exports._submissionHeading(this);

	insert(errorMsg(this));

	div({ class: ['disabler-range', _if(not(eq(this.businessProcess._guideProgress, 1)),
		'disabler-active')], id: 'forms-disabler-range' },
		div({ class: 'disabler' }),
		generateSections(this.businessProcess.submissionForms.applicable, { viewContext: this }));

	insert(_if(eq(this.businessProcess._guideProgress, 1),
		_if(or(lt(this.businessProcess.dataForms._progress, 1),
			lt(this.businessProcess.requirementUploads._progress, 1),
			lt(this.businessProcess.submissionForms._formsProgress, 1)),
			section({ class: 'section-warning' },
				ul(
					_if(lt(this.businessProcess.dataForms._progress, 1),
						li(a({ class: 'form-complition-link', href: '/forms/' },
							_("Some mandatory fields on tab 'Enter your details' have not been completed")))),
					_if(not(eq(this.businessProcess.requirementUploads._progress, 1)),
						li(a({ class: 'form-complition-link', href: '/documents/' },
							_("Some documents have not been uploaded")))),
					_if(not(eq(this.businessProcess.submissionForms._formsProgress, 1)),
						li(a({ class: 'form-complition-link', onclick: 'window.scroll(0, 0)' },
							_("Some mandatory fields on tab 'Send' have not been completed"))))
				)),
			form(
				{ action: '/application-submit/', method: 'post', id: 'submit-form' },
				section(
					{ class: 'section-primary user-submission-sworn-declaration' },
					h2(_("Acceptance")),
					p(_("Before sending, you must accept that the information entered into the system, " +
						"would be saved and processed by the involved institutions")),
					hr(),
					label({ class: 'input-aside' }, span(input({
						id: 'input-certified-truth',
						name: this.businessProcess.submissionForms.__id__ + '/isAffidavitSigned',
						type: 'checkbox',
						'data-type': 'boolean',
						checked: and(this.businessProcess.submissionForms._isAffidavitSigned,
							not(this.businessProcess._isSentBack)),
						value: '1'
					}), input({
						type: 'hidden',
						name: this.businessProcess.submissionForms.__id__ + '/isAffidavitSigned',
						'data-type': 'boolean',
						value: '0'
					})), " ", span(_("I, ${ fullName }, declare under oath that the information, " +
						"regarding registration of \"${ businessName }\", entered into the system is " +
						"correct, and I accept that it would be saved and processed by involved institutions.",
						{ fullName: this.user._fullName, businessName: this.businessProcess._businessName })))
				),
				div(p({ id: 'application-submit-button' },
					_if(this.user._isDemo,
						a({ class: 'user-submission-button', href: '#register' }, _("Send request")),
						button({ type: 'submit', class: 'user-submission-button' }, _("Send request"))))),
				script(
					function () {
						var checkbox = $('input-certified-truth')
						  , submitP = $('application-submit-button');

						$.onEnvUpdate('submit-form', function () {
							submitP.toggle(checkbox.checked);
						});
					}
				)
			))));
};

exports._submissionHeading = function (context) {
	var headingText = _("4 Send your files");

	return div(
		{ class: 'capital-first' },
		div(headingText[0]),
		div(
			h1(headingText.slice(1).trim()),
			p(_("Approve the sworn declaration and submit your application."))
		)
	);
};
