// Generic forms user page (Part A)

'use strict';

var generateSections = require('./components/generate-form-sections')
, sectionsToFormNavConfig = require('./components/utils/sections-to-form-nav-config')
, incompleteFormNav = require('./components/incomplete-form-nav')
, _  = require('mano').i18n.bind('Registration');

exports._parent = require('./user-registration-base');

exports['step-guide'] = { class: { 'step-form': true } };

exports.step = function () {
	exports._formsHeading();

	insert(_if(or(not(eq(this.businessProcess._guideProgress, 1)), this.businessProcess._isSentBack),
		div({ class: 'error-main' },
			_if(not(eq(this.businessProcess._guideProgress, 1)),
				function () { return "Please fill the Guide first"; },
					_if(this.businessProcess._isSentBack,
					function () { exports._sentBackInformation(this); }.bind(this))))));

	div({ class: ['disabler-range', _if(not(eq(this.businessProcess._guideProgress, 1)),
				'disabler-active')], id: 'forms-disabler-range' },
		generateSections(this.businessProcess.dataForms.applicable),
		div({ class: 'disabler' }));

	insert(_if(not(eq(this.businessProcess.dataForms._progress, 1)),
		section({ class: 'section-warning' },
			incompleteFormNav(sectionsToFormNavConfig(this.businessProcess.dataForms.applicable))),
		div({ class: 'user-next-step-button' },
			a({ href: '/documents/' }, _("Continue to next step")))));

};

exports._formsHeading = Function.prototype;
