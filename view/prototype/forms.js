'use strict';

var db = require('mano').db
  , generateSections = require('../components/generate-sections')
  , user = db.User.prototype;

//partners section custom footer
user.formSections.forEach(function (section) {
	if (section.propertyName === 'partners') {
		section.generateFooter = function (propertyName) {
			return tr(
				th({ class: 'desktop-only' }, "Summary"),
				th(""),
				th({ class: 'desktop-only' }, "Directors no: 3"),
				th({ class: 'desktop-only' }, "Subscriber no: 3"),
				th({ class: 'desktop-only' }, ""),
				th({ class: 'actions' }, "")
			);
		};
	}
});

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
