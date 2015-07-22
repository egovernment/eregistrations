'use strict';

var generateSections = require('./components/generate-form-sections');

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
			a({ href: '/documents/' }, "Continue to next step")),
		div({ class: 'disabler' })
	);
};

exports._formsHeading = Function.prototype;
exports._errorInformation = Function.prototype;
exports._mainInformation = Function.prototype;
