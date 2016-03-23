// Generic forms user page (Part A)

'use strict';

var generateSections  = require('./components/generate-form-sections')
  , incompleteFormNav = require('./components/incomplete-form-nav')
  , _                 = require('mano').i18n.bind('Registration')
  , errorMsg          = require('./_business-process-error-info').errorMsg
  , infoMsg           = require('./_business-process-optional-info').infoMsg;

exports._parent = require('./business-process-base');

exports['step-guide'] = { class: { 'step-form': true } };

exports.step = function () {
	var businessProcess = this.businessProcess
	  , dataForms       = businessProcess.dataForms
	  , guideProgress   = businessProcess._guideProgress;

	exports._formsHeading(this);

	insert(errorMsg(this));
	insert(infoMsg(this));
	insert(exports._optionalInfo(this));

	div({ class: ['disabler-range', _if(not(eq(guideProgress, 1)),
				'disabler-active')], id: 'forms-disabler-range' },
		div({ class: 'disabler' }),
		exports._forms(this));

	insert(_if(and(eq(guideProgress, 1),
		eq(dataForms._progress, 1)),
		div({ class: 'user-next-step-button' },
			a({ href: '/documents/' }, _("Continue to next step"))),
		_if(gt(dataForms._progress, 0), section({ class: 'section-warning' },
			incompleteFormNav(dataForms.applicable)))
		));

};

exports._formsHeading = function (context) {
	var headingText = _("1 Fill the form");

	return div(
		{ class: 'capital-first' },
		div(headingText[0]),
		div(
			h1(headingText.slice(1).trim()),
			p(_("Answer all mandatory questions."))
		)
	);
};

// Displayed together with error info and 'global' optional info
exports._optionalInfo = Function.prototype;

exports._forms = function (context) {
	return generateSections(context.businessProcess.dataForms.applicable, { viewContext: context });
};
