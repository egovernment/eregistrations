// Generic guide user page (Part A)

'use strict';

var camelToHyphen  = require('es5-ext/string/#/camel-to-hyphen')
  , sentBackInfo   = require('./_business-process-sent-back-info')
  , _              = require('mano').i18n.bind('Registration')
  , inventoryModal = require('./_business-process-inventory')
  , infoMsg        = require('./_business-process-optional-info').infoMsg;

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
	var businessProcess  = this.businessProcess
	  , isSentBack       = businessProcess._isSentBack
	  , guideFinished    = eq(businessProcess._guideProgress, 1)
	  , paymentProcessed = and(businessProcess.costs._paymentWeight,
			businessProcess.costs._paymentProgress);

	exports._guideHeading(this);

	insert(_if(isSentBack,
		function () { return div({ class: 'info-main' }, sentBackInfo(this)); }.bind(this),
		_if(and(guideFinished, paymentProcessed, not(exports._forceEnabledState(this))), div(
			{ class: 'info-main' },
			_("The guide is disabled as you have already processed your payment.")
		))));
	insert(infoMsg(this));
	insert(exports._optionalInfo(this));

	disabler(
		{ id: 'guide-disabler-range' },
		and(guideFinished, or(isSentBack, paymentProcessed), not(exports._forceEnabledState(this))),
		businessProcess.inventory ? insert(inventoryModal(businessProcess)) : null,
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
	legacy('refreshGuide', 'guide-form', businessProcess.__id__, businessProcess.constructor.__id__);
};

exports._forceEnabledState = Function.prototype;

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

// Displayed together with sent back info and 'global' optional info
exports._optionalInfo = Function.prototype;
exports._customScripts = Function.prototype;

// Questions

exports._questionsSection = function (context) {
	return div(
		{ class: ['section-primary', 'user-guide-questions-section'] },
		h2(_("Questions")),
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
	var registrationsMap = context.businessProcess.registrations.map;

	return div(
		{ class: ['section-primary', 'user-guide-registrations-section'] },
		div(
			{ id: 'mandatory-registrations-section', class: 'section-primary-wrapper' },
			h2(_("Mandatory Registrations")),
			exports._mandatoryRegistrationIntro(context),
			ul({ id: 'mandatory-registrations-list' }, registrationsMap, function (registration) {
				var key   = registration.key
				  , idKey = camelToHyphen.call(registration.key)
				  , spanContent;

				spanContent = getRegistrationSpanContent(registration);
				// false means the group has already been rendered
				if (spanContent === false) return;
				li({ id: 'registration-mandatory-li-' + idKey, 'data-key': key },
					label({ class: 'input-aside' },
						input({ id: 'registration-mandatory-input-' + idKey,
							dbjs: registration._isRequested, type: 'checkbox' }), " ",
						span(spanContent)));
			})
		),
		div(
			{ id: 'optional-registrations-section', class: 'section-primary-wrapper' },
			h2(_("Optional Registrations")),
			exports._optionalRegistrationIntro(context),
			ul({ id: 'optional-registrations-list' }, registrationsMap, function (registration) {
				var key   = registration.key
				  , idKey = camelToHyphen.call(registration.key)
				  , spanContent;

				spanContent = getRegistrationSpanContent(registration);
				// false means the group has already been rendered
				if (spanContent === false) return;
				li({ id: 'registration-optional-li-' + idKey, 'data-key': key },
					label({ class: 'input-aside' },
						input({ id: 'registration-optional-input-' + idKey,
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
		exports._requirementsIntro(context),
		ul({ id: 'requirements-list', class: 'user-guide-requirements-list' },
			context.businessProcess.requirements.map,
			function (requirement) {
				li({ 'data-key': requirement.key },
					requirement.toGuideDOM ? requirement.toGuideDOM() : [requirement.label,
							requirement.legend && [br(), small(mdi(requirement.legend))]]);
			}),
		exports._requirementsFooter(context)
	);
};

exports._requirementsIntro = function (context) {
	return p({ class: "section-primary-legend" },
		_("These are the documents you have to upload and send with your application:"));
};

exports._requirementsFooter = Function.prototype;

// Costs

exports._costsSection = function (context) {
	return div(
		{ id: 'costs-section', class: ['section-primary', 'user-guide-costs-section'] },
		h2(_("Costs")),
		exports._costsIntro(context),
		ul({ id: 'costs-list', class: 'user-guide-costs-list' }, exports._costsList(context)),
		div({ class: 'user-guide-costs-footer' }, exports._costsFooter(context))
	);
};

exports._costsIntro = function (context) {
	return p({ class: "section-primary-legend" },
		_("These are the fees you will need to pay before obtaining your certificates:"));
};

exports._costsList = function (context) {
	return [list(context.businessProcess.costs.map,
		function (cost) {
			var key          = cost.key
			  , idKey        = camelToHyphen.call(cost.key)
			  , optionalInfo = cost.optionalInfo;

			li({ id: 'cost-li-' + idKey, 'data-key': key },
				span({ class: 'user-guide-costs-list-label' },
					span({ id: 'cost-label-' + idKey }, cost.label),
					optionalInfo && span({ class: 'input-optional-info' },
						span({ class: 'fa fa-info-circle' }, "Info"),
						span({ class: 'input-optional-info-content' },
							typeof optionalInfo === 'string' ? md(optionalInfo) : optionalInfo)),
					small(cost.legend)),
				span({ id: 'cost-amount-' + idKey }));
		}),
		li({ id: 'cost-li-total', class: 'user-guide-total-costs' },
			span({ class: 'user-guide-costs-list-label' }, _("Total Costs:")), " ",
			span({ id: 'costs-total' }))];
};

exports._costsFooter = function (context) {
	return a({ id: 'print-costs-link', class: 'button-resource-link', href: '/costs-print/',
		target: '_blank' }, span({ class: 'fa fa-print' }), " ", _("Print costs list"));
};
