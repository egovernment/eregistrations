'use strict';

var camelToHyphen = require('es5-ext/string/#/camel-to-hyphen'),
_  = require('mano').i18n.bind('Registration');

exports._parent = require('./user-registration-base');

exports['step-guide'] = { class: { 'step-active': true } };

exports.step = function () {

	exports._guideHeading();

	div(
		{ class: ['disabler-range', _if(this.businessProcess._isSentBack, 'disabler-active')] },
		form(
			{ id: 'guide-form', class: 'user-guide', action: '/guide/', method: 'post' },
			div({ class: 'section-primary' }, h2(_("Questions")),
				hr(),
				this.businessProcess.determinants.toDOMFieldset(document)),

			div({ class: 'section-primary' },
				h2(_("Mandatory Registrations")),
				hr(),
				exports._registrationIntro(),
				ul(this.businessProcess.registrations.map,
					function (registration) {
						li({ id: 'registration-mandatory-' + camelToHyphen.call(registration.key) },
							label({ class: 'input-aside' },
								input({ dbjs: registration._isRequested, type: 'checkbox' }), " ",
								span(registration.label)));
					}),
				div({ class: 'section-primary-wrapper' },
					h2(_("Optional Registrations")),
					hr(),
					ul(this.businessProcess.registrations.map,
						function (registration) {
							li({ id: 'registration-optional-' + camelToHyphen.call(registration.key) },
								label({ class: 'input-aside' },
									input({ dbjs: registration._isRequested, type: 'checkbox' }), " ",
									span(registration.label)));
						}))),

			div({ class: 'section-primary' }, h2(_("Requirements")),
				hr(),
				exports._requirementsIntro(),
				ul({ class: 'user-guide-requirements-list' },
					this.businessProcess.requirements.map,
					function (requirement) {
						li({ id: 'requirement-' + camelToHyphen.call(requirement.key) },
							requirement.label);
					})),

			div({ class: 'section-primary' }, h2(_("Costs")),
				hr(),
				exports._costsIntro(),
				ul({ id: 'costs-list', class: 'user-guide-costs-list' },
					list(this.businessProcess.costs.map,
						function (cost) {
							li({ id: 'cost-' + camelToHyphen.call(cost.key) },
								span({ class: 'user-guide-costs-list-label' }, cost.label),
								span({ id: 'cost-amount-' + camelToHyphen.call(cost.key) }));
						}),
					li({ class: 'user-guide-total-costs' },
						span({ class: 'user-guide-costs-list-label' }, _("Total Costs:")), " ",
						span({ id: 'costs-total' }))
					),
				p({ id: 'costs-print' },
					a({ class: 'button-resource-link', href: '/costs-print/', target: '_blank' },
						span({ class: 'fa fa-print' }), " ", "Print costs list"))),
			p({ class: 'user-next-step-button' },
				button({ type: 'submit' },
					_("Save and continue")))
		),
		div({ class: 'disabler' })
	);
};

exports._guideHeading = Function.prototype;
exports._registrationIntro = Function.prototype;
exports._requirementsIntro = Function.prototype;
exports._costsIntro = Function.prototype;
