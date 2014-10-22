'use strict';

var db = require('mano').db
  , generateSections = require('../components/generate-form-sections')
  , user = db.User.prototype;

exports['step-form'] = { class: { 'step-active': true } };

exports.step = function () {
	h1("2. Fill the form");
	div({ class: 'error-main' },
		p(span({ class: 'fa fa-exclamation-circle' }), "Please fill the Guide first"));
	div(
		{ class: 'disabler-range', id: 'forms-disabler-range' },
		generateSections(user.formSections),
		div({ class: 'next-step' },
			a({ href: '/documents/' }, "Continue to next step")),
		div({ class: 'disabler' })
	);
};
