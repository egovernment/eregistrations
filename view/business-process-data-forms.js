// Generic forms user page (Part A)

'use strict';

var _                 = require('mano').i18n.bind('View: Business Process')
  , generateSections  = require('./components/generate-form-sections')
  , incompleteFormNav = require('./components/incomplete-form-nav')
  , errorMsg          = require('./components/business-process-error-info').errorMsg
  , infoMsg           = require('./components/business-process-optional-info').infoMsg
  , formsHeading      = require('./components/business-process-data-forms-heading');

exports._parent = require('./business-process-base');

exports.step = function () {
	var businessProcess = this.businessProcess
	  , dataForms       = businessProcess.dataForms
	  , guideProgress   = businessProcess._guideProgress;

	exports._formsHeading.call(this);

	insert(errorMsg(this));
	insert(infoMsg(this));
	insert(exports._optionalInfo.call(this));

	disabler(
		{ id: 'forms-disabler-range' },
		exports._disableCondition.call(this),
		exports._forms.call(this)
	);

	insert(_if(and(eq(guideProgress, 1),
		eq(dataForms._progress, 1)),
		div({ class: 'user-next-step-button' },
			a({ href: '/documents/' }, _("Continue to next step"))),
		_if(gt(dataForms._progress, 0), section({ class: 'section-warning' },
			incompleteFormNav(dataForms.applicable)))
		));
};

exports._disableCondition = function () {
	return not(eq(this.businessProcess._guideProgress, 1));
};

exports._formsHeading = formsHeading;

// Displayed together with error info and 'global' optional info
exports._optionalInfo = Function.prototype;

exports._forms = function () {
	return generateSections(this.businessProcess.dataForms.applicable, { viewContext: this });
};
