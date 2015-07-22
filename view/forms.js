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

	div({ class: 'error-main' },
		exports._errorInformation());

	div({ class: 'info-main free-form' },
		exports._mainInformation());

	div(
		{ class: 'disabler-range', id: 'forms-disabler-range' },
		generateSections(this.businessProcess.dataForms.applicable),

		div({ class: 'user-next-step-button' },
			a({ href: '/documents/' }, _("Continue to next step"))),
		div({ class: 'disabler' })
	);

	section({ class: 'section-warning' },
		incompleteFormNav(sectionsToFormNavConfig(this.businessProcess.dataForms.applicable)));

};

exports._formsHeading = Function.prototype;
exports._errorInformation = Function.prototype;
exports._mainInformation = Function.prototype;
