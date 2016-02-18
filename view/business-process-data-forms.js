// Generic forms user page (Part A)

'use strict';

var generateSections  = require('./components/generate-form-sections')
  , incompleteFormNav = require('./components/incomplete-form-nav')
  , incompleteFormNavRules = require('./components/incomplete-form-nav-rules')
  , _                 = require('mano').i18n.bind('Registration')
  , errorMsg          = require('./_business-process-error-info').errorMsg;

exports._parent = require('./business-process-base');

exports['step-guide'] = { class: { 'step-form': true } };

exports.step = function () {
	exports._formsHeading(this);

	insert(errorMsg(this));

	div({ class: ['disabler-range', _if(not(eq(this.businessProcess._guideProgress, 1)),
				'disabler-active')], id: 'forms-disabler-range' },
		div({ class: 'disabler' }),
		exports._forms(this));

	insert(_if(and(eq(this.businessProcess._guideProgress, 1),
		eq(this.businessProcess.dataForms._progress, 1)),
		div({ class: 'user-next-step-button' },
			a({ href: '/documents/' }, _("Continue to next step"))),
		_if(gt(this.businessProcess.dataForms._progress, 0), section({ class: 'section-warning' },
			incompleteFormNav(this.businessProcess.dataForms.applicable),
			incompleteFormNavRules(this.businessProcess.dataForms.applicable)))
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

exports._forms = function (context) {
	return generateSections(context.businessProcess.dataForms.applicable, { viewContext: context });
};
