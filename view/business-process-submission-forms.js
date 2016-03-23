// Generic submission user page (Part A)

'use strict';

var generateSections = require('./components/generate-form-sections')
  , errorMsg         = require('./_business-process-error-info').errorMsg
  , _                = require('mano').i18n.bind('Registration');

exports._parent = require('./business-process-base');

exports['step-submission'] = { class: { 'step-active': true } };

exports.step = function () {
	var user                       = this.user
	  , businessProcess            = this.businessProcess
	  , submissionForms            = businessProcess.submissionForms
	  , guideProgress              = businessProcess._guideProgress
	  , dataFormsProgress          = businessProcess.dataForms._progress
	  , requirementUploadsProgress = businessProcess.requirementUploads._progress;

	exports._submissionHeading(this);

	insert(errorMsg(this));
	exports._parent._optionalInfo(this);
	exports._submissionOptionalInfo(this);

	div({ class: ['disabler-range', _if(not(eq(guideProgress, 1)),
		'disabler-active')], id: 'forms-disabler-range' },
		div({ class: 'disabler' }),
		generateSections(submissionForms.applicable, { viewContext: this }));

	insert(_if(eq(guideProgress, 1),
		_if(or(lt(dataFormsProgress, 1), lt(requirementUploadsProgress, 1),
			lt(submissionForms._formsProgress, 1)),
			section({ class: 'section-warning' },
				ul(
					_if(lt(dataFormsProgress, 1),
						li(a({ class: 'form-complition-link', href: '/forms/' },
							_("Some mandatory fields on tab 'Enter your details' have not been completed")))),
					_if(not(eq(requirementUploadsProgress, 1)),
						li(a({ class: 'form-complition-link', href: '/documents/' },
							_("Some documents have not been uploaded")))),
					_if(not(eq(submissionForms._formsProgress, 1)),
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
					label({ class: 'input-aside' }, span(input({
						id: 'input-certified-truth',
						name: submissionForms.__id__ + '/isAffidavitSigned',
						type: 'checkbox',
						'data-type': 'boolean',
						checked: and(submissionForms._isAffidavitSigned, not(businessProcess._isSentBack)),
						value: '1'
					}), input({
						type: 'hidden',
						name: submissionForms.__id__ + '/isAffidavitSigned',
						'data-type': 'boolean',
						value: '0'
					})), " ", span(_("I, ${ fullName }, declare under oath that the information, " +
						"regarding registration of \"${ businessName }\", entered into the system is " +
						"correct, and I accept that it would be saved and processed by involved institutions.",
						{ fullName: user._fullName, businessName: businessProcess._businessName })))
				),
				div(p({ id: 'application-submit-button' },
					_if(user._isDemo,
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

// Displayed together with error info and 'global' optional info
exports._submissionOptionalInfo = Function.prototype;
