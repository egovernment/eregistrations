'use strict';

var db = require('mano').db,
		partner = db.Partner.prototype;

exports['step-form'] = { class: { 'step-active': true } };

exports.step = function () {
	form(
		h1("Add new Partner"),
		fieldset({ class: 'section-primary' }, h2("Business Partner basic informations"),
			hr(),
			fieldset({ class: 'form-elements forms', dbjs: partner, names: ['firstName',
				'lastName', 'dateOfBirth', 'userEmail'] }),
			p({ class: 'submit-placeholder input' },
				input({ type: 'submit' }, "Submit")
				)
			)
	);

	form(
		fieldset({ class: 'section-primary' }, h2("Business Partner secondary informations"),
			hr(),
			fieldset({ class: 'form-elements forms', dbjs: partner, names: ['companyType', 'inventory',
				'surfaceArea', 'isOwner', 'businessActivity'] }),
			p({ class: 'submit-placeholder input' },
				input({ type: 'submit' }, "Submit")
				)
			)
	);

	div(
		{ class: 'next-step' },
		a({ href: '/forms/' }, "Save")
	);
};
