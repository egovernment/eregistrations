// Generic forms user page (Part A)

'use strict';

var generateSections      = require('./components/generate-form-sections')
, incompleteFormNav       = require('./components/incomplete-form-nav')
, _                       = require('mano').i18n.bind('Registration')
, errorMsg                = require('./_business-process-error-info').errorMsg;

exports._parent = require('./business-process-base');

exports['step-guide'] = { class: { 'step-form': true } };

exports.step = function () {
	exports._formsHeading();

	insert(errorMsg(this));

	div({ class: ['disabler-range', _if(not(eq(this.businessProcess._guideProgress, 1)),
				'disabler-active')], id: 'forms-disabler-range' },
		generateSections(this.businessProcess.dataForms.applicable, { viewContext: this }),
		div({ class: 'disabler' }));

	insert(_if(eq(this.businessProcess.dataForms._progress, 1),
		div({ class: 'user-next-step-button' },
			a({ href: '/documents/' }, _("Continue to next step"))),
		_if(gt(this.businessProcess.dataForms._progress, 0), section({ class: 'section-warning' },
			incompleteFormNav(this.businessProcess.dataForms.applicable)))
		));

};

exports._formsHeading = Function.prototype;
