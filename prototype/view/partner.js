'use strict';

var db = require('mano').db,
	partner = db.partnerFrank,
	generateSections = require('./components/generate-sections'),
	user = db.User.prototype;

exports._parent = require('./_user-main');

exports['step-form'] = { class: { 'step-active': true } };

exports.step = function () {
	div(
		{ class: 'entity-header' },
		h1("Partner: " + partner._firstName + " " + partner._lastName),
		div(
			{ class: 'entity-header-actions' },
			a({ class: 'button-main' },
				"Edit", span({ class: 'fa fa-edit' }, "Edit")),
			a({ class: 'button-main' }, "Delete", span({ class: 'fa fa-trash-o' }, "Delete"))
		)
	);

	div({ class: 'section-primary entity-data-section-primary' },
		generateSections(user.formSections));

	div({ class: 'user-next-step-button' },
		a({ href: '/forms/' }, "Back to forms")
		);
};
