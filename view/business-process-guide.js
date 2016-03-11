// Generic guide user page (Part A)

'use strict';

var camelToHyphen = require('es5-ext/string/#/camel-to-hyphen')
  , sentBackInfo  = require('./_business-process-sent-back-info')
  , _             = require('mano').i18n.bind('Registration')
  , inventoryModal = require('./_business-process-inventory');

/**
 * getRegistrationSpanContent
 *
 * @param registration to check for groups
 * @returns {*}
 * - {Array} spanContent is the dom of the group
 * - {Boolean} false when group was already rendered
 * - {String} label when no group found for the registration
 */
var getRegistrationSpanContent = function (registration) {
	var spanContent = registration.label;
	registration.master.registrations.groups.forEach(function (group) {
		if (group.has(registration)) {
			/**
			 * by convention first in registration in group set is
			 * the one for which the checkbox will be created
			 */
			if (group.first === registration) {
				spanContent = [];
				group.forEach(function (groupedReg) {
					spanContent.push(groupedReg.label);
					if (groupedReg !== group.last) {
						spanContent.push(br());
					}
				});
			} else {
				spanContent = false;
			}
		}
	});
	return spanContent;
};

exports._parent = require('./business-process-base');

exports['step-guide'] = { class: { 'step-active': true } };

exports.step = function () {

	exports._guideHeading(this);

	insert(_if(this.businessProcess._isSentBack,
		function () { return div({ class: 'info-main' }, sentBackInfo(this)); }.bind(this),
		_if(and(this.businessProcess.costs._paymentWeight,
			this.businessProcess.costs._paymentProgress), div({ class: 'info-main' },
				_("The guide is disabled as you have already processed your payment.")))));

	div(
		{ class: ['disabler-range',
			_if(or(this.businessProcess._isSentBack,
					and(this.businessProcess.costs._paymentWeight,
						this.businessProcess.costs._paymentProgress)),
				'disabler-active')] },
		this.businessProcess.inventory ? insert(inventoryModal(this.businessProcess)) : null,
		div({ class: 'disabler' }),
		form(
			{ id: 'guide-form', class: 'user-guide', action: '/guide/', method: 'post' },
			exports._questionsSection(this),
			exports._registrationsSection(this),
			exports._requirementsSection(this),
			exports._costsSection(this),
			p({ id: 'guide-save-button', class: 'user-next-step-button' },
				button({ type: 'submit' },
					_("Save and continue"))),
			div({ id: 'no-requested-registrations-section',
					class: 'section-primary user-guide-no-requested-registrations-info' },
				p(_("You need to select at least one registration to continue with the process")))
		)
	);

	exports._customScripts(this);
	legacy('refreshGuide', 'guide-form', this.businessProcess.__id__,
		this.businessProcess.constructor.__id__);
};

exports._guideHeading = function (context) {
	var headingText = _("Obtain your certificates");

	return div(
		{ class: "capital-first" },
		div(headingText[0]),
		div(
			h1(headingText.slice(1).trim()),
			p(_("Answer the following questions to determine required documents and registration fees."))
		)
	);
};

exports._customScripts = Function.prototype;

// Questions

exports._questionsSection = function (context) {
	return div(
		{ class: ['section-primary', 'user-guide-questions-section'] },
		h2(_("Questions")),
		hr(),
		exports._questionsIntro(context),
		context.businessProcess.determinants.toDOMFieldset(document, { formId: 'guide-form' })
	);
};

exports._questionsIntro = function (context) {
	return p({ class: "section-primary-legend" },
		_("These questions allow you to determine what " +
			"requirements are needed and what are the costs of the registrations:"));
};

// Registrations

exports._registrationsSection = function (context) {
	return div(
		{ class: ['section-primary', 'user-guide-registrations-section'] },
		div(
			{ id: 'mandatory-registrations-section', class: 'section-primary-wrapper' },
			h2(_("Mandatory Registrations")),
			hr(),
			exports._mandatoryRegistrationIntro(context),
			ul({ id: 'mandatory-registrations-list' }, context.businessProcess.registrations.map,
				function (registration) {
					var spanContent;
					spanContent = getRegistrationSpanContent(registration);
					// false means the group has already been rendered
					if (spanContent === false) return;
					li({ id: 'registration-mandatory-li-' + camelToHyphen.call(registration.key),
							'data-key': registration.key },
						label({ class: 'input-aside' },
							input({ id: 'registration-mandatory-input-' +
								camelToHyphen.call(registration.key),
								dbjs: registration._isRequested, type: 'checkbox' }), " ",
							span(spanContent)));
				})
		),
		div(
			{ id: 'optional-registrations-section', class: 'section-primary-wrapper' },
			h2(_("Optional Registrations")),
			hr(),
			exports._optionalRegistrationIntro(context),
			ul({ id: 'optional-registrations-list' }, context.businessProcess.registrations.map,
				function (registration) {
					var spanContent;
					spanContent = getRegistrationSpanContent(registration);
					// false means the group has already been rendered
					if (spanContent === false) return;
					li({ id: 'registration-optional-li-' + camelToHyphen.call(registration.key),
							'data-key': registration.key },
						label({ class: 'input-aside' },
							input({ id: 'registration-optional-input-' + camelToHyphen.call(registration.key),
								dbjs: registration._isRequested, type: 'checkbox' }), " ",
							span(spanContent)));
				})
		)
	);
};

exports._mandatoryRegistrationIntro = Function.prototype;

exports._optionalRegistrationIntro = function (context) {
	return p({ class: "section-primary-legend" },
		_("You have the possibility to additionally request following registrations:"));
};

// Requirements

exports._requirementsSection = function (context) {
	return div(
		{ id: 'requirements-section', class: ['section-primary',
			'user-guide-requirements-section'] },
		h2(_("Requirements")),
		hr(),
		exports._requirementsIntro(context),
		ul({ id: 'requirements-list', class: 'user-guide-requirements-list' },
			context.businessProcess.requirements.map,
			function (requirement) {
				li({ 'data-key': requirement.key },
					requirement.toGuideDOM ? requirement.toGuideDOM() : [requirement.label,
							requirement.legend && [br(), small(mdi(requirement.legend))]]);
			})
	);
};

exports._requirementsIntro = function (context) {
	return p({ class: "section-primary-legend" },
		_("These are the documents you have to upload and send with your application:"));
};

// Costs

exports._costsSection = function (context) {
	return div(
		{ id: 'costs-section', class: ['section-primary', 'user-guide-costs-section'] },
		h2(_("Costs")),
		hr(),
		exports._costsIntro(context),
		ul({ id: 'costs-list', class: 'user-guide-costs-list' }, exports._costsList(context)),
		p(a({ id: 'print-costs-link', class: 'button-resource-link', href: '/costs-print/',
			target: '_blank' }, span({ class: 'fa fa-print' }), " ", _("Print costs list")))
	);
};

exports._costsIntro = function (context) {
	return p({ class: "section-primary-legend" },
		_("These are the fees you will need to pay before obtaining your certificates:"));
};

exports._costsList = function (context) {
	return [list(context.businessProcess.costs.map,
		function (cost) {
			li({ id: 'cost-li-' + camelToHyphen.call(cost.key), 'data-key': cost.key },
				span({ class: 'user-guide-costs-list-label' },
					span({ id: 'cost-label-' + camelToHyphen.call(cost.key) }, cost.label),
					cost.optionalInfo && span({ class: 'input-optional-info' },
						span({ class: 'fa fa-info-circle' }, "Info"),
						span({ class: 'input-optional-info-content' },
							typeof cost.optionalInfo === 'string' ? md(cost.optionalInfo)
								: cost.optionalInfo)),
					small(cost.legend)),
				span({ id: 'cost-amount-' + camelToHyphen.call(cost.key) }));
		}),
		li({ id: 'cost-li-total', class: 'user-guide-total-costs' },
			span({ class: 'user-guide-costs-list-label' }, _("Total Costs:")), " ",
			span({ id: 'costs-total' }))];
};
