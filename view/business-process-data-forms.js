// Generic forms user page (Part A)

'use strict';

var _                    = require('mano').i18n.bind('Registration')
  , generateSections     = require('./components/generate-form-sections')
  , incompleteFormNav    = require('./components/incomplete-form-nav')
  , disableConditionally = require('./components/disable-conditionally')
  , errorMsg             = require('./_business-process-error-info').errorMsg
  , infoMsg              = require('./_business-process-optional-info').infoMsg;

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

	insert(disableConditionally(
		exports._forms(this),
		not(eq(guideProgress, 1)),
		{
			forcedState: exports._forcedState(this),
			id: 'forms-disabler-range'
		}
	));

	insert(_if(and(eq(guideProgress, 1),
		eq(dataForms._progress, 1)),
		div({ class: 'user-next-step-button' },
			a({ href: '/documents/' }, _("Continue to next step"))),
		_if(gt(dataForms._progress, 0), section({ class: 'section-warning' },
			incompleteFormNav(dataForms.applicable)))
		));
};

// Resolves forced disabler state of the forms
exports._forcedState = Function.prototype;

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
