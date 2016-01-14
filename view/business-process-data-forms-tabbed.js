// Generic forms user page (Part A)

'use strict';

var incompleteFormNav = require('./components/incomplete-form-nav')
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
		exports._formstabs(this),
		div({ id: 'forms-sections-content' }));

	insert(_if(and(eq(this.businessProcess._guideProgress, 1),
		eq(this.businessProcess.dataForms._progress, 1)),
		div({ class: 'user-next-step-button' },
			a({ href: '/documents/' }, _("Continue to next step"))),
		_if(gt(this.businessProcess.dataForms._progress, 0), section({ class: 'section-warning' },
			incompleteFormNav(this.businessProcess.dataForms.applicable)))
		));

};

exports._formsHeading = function (context) {
	return div(
		{ class: 'capital-first' },
		div("1"),
		div(
			h1(_("Fill the form")),
			p(_("Answer all mandatory questions."))
		)
	);
};

exports._formstabs = function (context) {
	context.businessProcess.dataForms.applicable.forEach(function (section) {
		return a({ href: "/forms/" + section.label.replace(/ /g, '').toLowerCase(), class: 'tab' },
			section._label);
	});
};
