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

	div({ class: ['disabler-range', _if(not(eq(this.businessProcess._guideProgress, 1)),
				'disabler-active')], id: 'forms-disabler-range' },
		generateSections(this.businessProcess.submissionForms.applicable),
		div({ class: 'disabler' }));

	insert(_if(or(lt(this.businessProcess.dataForms._progress, 1),
			lt(this.businessProcess.requirementUploads._progress, 1),
			lt(this.businessProcess.submissionForms._formsProgress, 1)), section(
		{ class: 'section-warning' },
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
		)
	),
		form(
			{ action: '/application-submit/', method: 'post', id: 'submit-form' },
			section(
				{ class: 'section-primary user-submission-sworn-declaration' },
				h2(_("Acceptance")),
				p(_("Before sending, you must accept that the information entered into the system, " +
					"would be saved and processed by the involved institutions")),
				hr(),
				field(
					{ dbjs: this.businessProcess.submissionForms._isAffidavitSigned,
						type: 'checkbox',
						control: { id: 'input-certified-truth' },
						label: _("I declare under oath that the information entered into the system " +
											"is absolute and faithfully to the reality."),
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
			div(p({ id: 'application-submit-button' },
				button({ type: 'submit', class: 'user-submission-button' }, _("Send request")))),
			script(
				function () {
					var checkbox = $('input-certified-truth')
					  , submitP = $('application-submit-button');

					$.onEnvUpdate('submit-form', function () {
						submitP.toggle(checkbox.checked);
					});
				}
			)
		)));
};

exports._submissionHeading = Function.prototype;
