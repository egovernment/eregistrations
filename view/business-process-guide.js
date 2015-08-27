// Generic guide user page (Part A)

'use strict';

var camelToHyphen = require('es5-ext/string/#/camel-to-hyphen')
  , sentBackInfo  = require('./_business-process-sent-back-info')
  , _             = require('mano').i18n.bind('Registration')
  , inventoryModal = require('./_business-process-inventory');

exports._parent = require('./business-process-base');

exports['step-guide'] = { class: { 'step-active': true } };

exports.step = function () {

	exports._guideHeading(this);

	insert(_if(this.businessProcess._isSentBack,
		function () { return div({ class: 'info-main' }, sentBackInfo(this)); }.bind(this)));

	div(
		{ class: ['disabler-range', _if(this.businessProcess._isSentBack, 'disabler-active')] },
		this.businessProcess.inventory ? insert(inventoryModal(this.businessProcess)) : null,
		form(
			{ id: 'guide-form', class: 'user-guide', action: '/guide/', method: 'post' },
			div({ class: 'section-primary' }, h2(_("Questions")),
				hr(),
				exports._questionsIntro(this),
				this.businessProcess.determinants.toDOMFieldset(document, { formId: 'guide-form' })),

			div({ class: 'section-primary' },
				div({ id: 'mandatory-registrations-section', class: 'section-primary-wrapper' },
					h2(_("Mandatory Registrations")),
					hr(),
					exports._mandatoryRegistrationIntro(this),
					ul({ id: 'mandatory-registrations-list' }, this.businessProcess.registrations.map,
						function (registration) {
							li({ id: 'registration-mandatory-li-' + camelToHyphen.call(registration.key),
									'data-key': registration.key },
								label({ class: 'input-aside' },
									input({ id: 'registration-mandatory-input-' +
										camelToHyphen.call(registration.key),
										dbjs: registration._isRequested, type: 'checkbox' }), " ",
									span(registration.label)));
						})),
				div({ id: 'optional-registrations-section', class: 'section-primary-wrapper' },
					h2(_("Optional Registrations")),
					hr(),
					exports._optionalRegistrationIntro(this),
					ul({ id: 'optional-registrations-list' }, this.businessProcess.registrations.map,
						function (registration) {
							li({ id: 'registration-optional-li-' + camelToHyphen.call(registration.key),
									'data-key': registration.key },
								label({ class: 'input-aside' },
									input({ id: 'registration-optional-input-' + camelToHyphen.call(registration.key),
										dbjs: registration._isRequested, type: 'checkbox' }), " ",
									span(registration.label)));
						}))),

			div({ class: 'section-primary' }, h2(_("Requirements")),
				hr(),
				exports._requirementsIntro(this),
				ul({ id: 'requirements-list', class: 'user-guide-requirements-list' },
					this.businessProcess.requirements.map,
					function (requirement) {
						li({ 'data-key': requirement.key },
							requirement.toGuideDOM ? requirement.toGuideDOM() : requirement.label);
					})),

			div({ class: 'section-primary' }, h2(_("Costs")),
				hr(),
				exports._costsIntro(this),
				ul({ id: 'costs-list', class: 'user-guide-costs-list' },
					list(this.businessProcess.costs.map,
						function (cost) {
							li({ 'data-key': cost.key },
								span({ class: 'user-guide-costs-list-label' }, cost.label, small(cost.legend)),
								span({ id: 'cost-amount-' + camelToHyphen.call(cost.key) }));
						}),
					li({ class: 'user-guide-total-costs' },
						span({ class: 'user-guide-costs-list-label' }, _("Total Costs:")), " ",
						span({ id: 'costs-total' }))
					),
				p(a({ id: 'print-costs-link', class: 'button-resource-link', href: '/costs-print/',
					target: '_blank' }, span({ class: 'fa fa-print' }), " ", "Print costs list"))),
			p({ class: 'user-next-step-button' },
				button({ type: 'submit' },
					_("Save and continue")))
		),
		div({ class: 'disabler' })
	);

	exports._customScripts(this);
	legacy('refreshGuide', 'guide-form', this.businessProcess.__id__,
		this.businessProcess.constructor.__id__);
};

exports._guideHeading               = Function.prototype;
exports._questionsIntro             = Function.prototype;
exports._mandatoryRegistrationIntro = Function.prototype;
exports._optionalRegistrationIntro  = Function.prototype;
exports._requirementsIntro          = Function.prototype;
exports._costsIntro                 = Function.prototype;
exports._customScripts              = Function.prototype;
