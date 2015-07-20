'use strict';

var db = require('mano').db,
camelToHyphen = require('es5-ext/string/#/camel-to-hyphen');

exports._parent = require('./user-registration-base');

exports['step-guide'] = { class: { 'step-active': true } };

exports.step = function () {

	exports._guideHeading();

	form(
		{ class: 'user-guide' },
		div({ class: 'section-primary' }, h2("Questions"),
			hr(),
			db.firstBusinessProcess.determinants.toDOMFieldset(document)),

		div({ class: 'section-primary' },
			h2("Registrations"),
			hr(),
			exports._registrationIntro(),
			ul(db.firstBusinessProcess.registrations.map,
				function (registration) {
					li({ id: 'registration-mandatory-' + camelToHyphen.call(registration.key) },
						label({ class: 'input-aside' },
							input({ dbjs: registration._isRequested, type: 'checkbox' }), " ",
							span(registration.label)));
				}),
			div({ class: 'section-primary-wrapper' },
				h2("Optional Registrations"),
				hr(),
				ul(db.firstBusinessProcess.registrations.map,
					function (registration) {
						li({ id: 'registration-optional-' + camelToHyphen.call(registration.key) },
							label({ class: 'input-aside' },
								input({ dbjs: registration._isRequested, type: 'checkbox' }), " ",
								span(registration.label)));
					}))),

		div({ class: 'section-primary' }, h2("Requirements"),
			hr(),
			exports._requirementsIntro(),
			ul({ class: 'user-guide-requirements-list' },
				db.firstBusinessProcess.requirements.map,
				function (requierment) {
					li({ id: 'requierment-' + camelToHyphen.call(requierment.key) },
						requierment.label);
				})),

		div({ class: 'section-primary' }, h2("Costs"),
			hr(),
			exports._costsIntro(),
			ul({ class: 'user-guide-costs-list' },
				list(db.firstBusinessProcess.costs.map,
					function (cost) {
						li({ id: 'cost-' + camelToHyphen.call(cost.key) },
							span({ class: 'user-guide-costs-list-label' }, cost.label),
							span(cost.amount));
					}),
				li({ class: 'user-guide-total-costs' },
					span({ class: 'user-guide-costs-list-label' }, "Total Costs:"), " ",
					span({ id: 'cost-total' }))
				),
			exports._costsEnding()),
		p({ class: 'user-next-step-button' },
			button({ type: 'submit' },
				"Save and continue"))
	);
};

exports._guideHeading = Function.prototype;
exports._registrationIntro = Function.prototype;
exports._requirementsIntro = Function.prototype;
exports._costsIntro = Function.prototype;
exports._costsEnding = Function.prototype;
