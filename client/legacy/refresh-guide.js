// Refreshes guide form data.

'use strict';

var camelToHyphen  = require('es5-ext/string/#/camel-to-hyphen')
  , $              = require('mano-legacy')
  , formatCurrency = require('./format-currency');

require('es3-ext/array/#/for-each/implement');
require('mano-legacy/for-each');
require('mano-legacy/on-env-update');
require('mano-legacy/dbjs-form-fill');

// Each hook is an array of scripts which are executed in corresponding parts of refresh guide
$.refreshGuideHooks = { atEnd: [],
	beforeRegistrationsApplicable: [], beforeRequirementsApplicable: [],
	beforeRegistrationsRequested: [] };

require('mano-legacy/get-text-child');

var getNamedListElements = function (listId) {
	var listElement = $(listId), result = {};

	if (listElement) {
		$.forEach(listElement.getElementsByTagName('li'), function (element) {
			var elementDataKey = element.getAttribute('data-key');

			if (element.parentNode !== listElement || !elementDataKey) return;

			result[elementDataKey] = $(element);
		});
	}

	return result;
};

var getPropertyValue = function (target, property) {
	var result = typeof target[property] === 'function'
		? target[property]($.dbjsObserveMock) : target[property];
	return result || ''; // Do not pass null/undefined literally
};

var buildCostsPrintLink = function (currentLink, cost, field, prefix) {
	if (!prefix) prefix = '';
	currentLink.search += (currentLink.search.length) ?
			'&' + prefix + cost.key + '=' + cost[field].toFixed(2) :
			'?' + prefix + cost.key + '=' + cost[field].toFixed(2);

	return currentLink;
};

var toggleConditionally = function (element, condition) {
	if (element) {
		element.toggle(condition);
	}
};

// A legacy refreshGuide method for Part A Guide page.
// Used in: /view/business-process-guide.js
module.exports = $.refreshGuide = function (guideFormId, businessProcessId,
		businessProcessTypeName) {
	var guideForm = $(guideFormId)
	  , noRequstedRegistrationsSection, mandatoryRegistrationsSection
	  , mandatoryRegistrationsListElements, mandatoryRegistrationsEmptyMessage
	  , optionalRegistrationsSection, optionalRegistrationsListElements
	  , requirementsSection, requirementsListElements, requirementsLabelElements = {}
	  , costsListElements, costsAmountsElements = {}, costsLabelElements = {}
	  , costsTotalElement, costsPrintLink, guideSaveButton
	  , costsSection, zeroCostsClass;

	// Create mock BusinessProcess
	var BusinessProcess = function () {};
	BusinessProcess.prototype = $.legacyDb[businessProcessTypeName].prototype;

	// Gather required list elements

	noRequstedRegistrationsSection = $('no-requested-registrations-section');
	mandatoryRegistrationsSection = $('mandatory-registrations-section');
	mandatoryRegistrationsEmptyMessage = $('mandatory-registrations-empty-message');
	mandatoryRegistrationsListElements = getNamedListElements('mandatory-registrations-list');
	optionalRegistrationsSection = $('optional-registrations-section');
	optionalRegistrationsListElements = getNamedListElements('optional-registrations-list');
	requirementsSection      = $('requirements-section');
	requirementsListElements = getNamedListElements('requirements-list');
	costsListElements = getNamedListElements('costs-list');
	costsPrintLink  = $('print-costs-link');
	costsSection    = $('costs-section');
	zeroCostsClass  = 'user-guide-zero-costs-amount';
	guideSaveButton = $('guide-save-button');

	$.forIn(costsListElements, function (li, name) {
		costsAmountsElements[name] = $.getTextChild('cost-amount-' + camelToHyphen.call(name));
		costsLabelElements[name] = $.getTextChild('cost-label-' + camelToHyphen.call(name));
	});

	$.forIn(requirementsListElements, function (li, name) {
		var labelElement = $('requirement-label-' + camelToHyphen.call(name));

		if (labelElement) requirementsLabelElements[name] = $.getTextChild(labelElement);
	});

	if ($('costs-total')) {
		costsTotalElement = $.getTextChild('costs-total');
	}

	// Crazy train...
	$.onEnvUpdate(guideForm, function () {
		// Create mock business process
		var businessProcess = new BusinessProcess();
		businessProcess.__id__ = businessProcessId;

		// -- First FormFill pass --

		// Perform dbjsFormFill
		$.dbjsFormFill(businessProcess, guideForm);

		$.refreshGuideHooks.beforeRegistrationsApplicable.forEach(function (hook) {
			hook(businessProcess, guideForm);
		});
		// Resolve applicable, mandatory and optional registrations
		businessProcess.registrations.map.forEach(function (registration) {
			registration.isApplicable = getPropertyValue(registration, 'isApplicable');
			registration.isMandatory = getPropertyValue(registration, 'isMandatory');
		});

		businessProcess.registrations.applicable =
			$.setify(businessProcess.registrations.applicable($.dbjsObserveMock));
		businessProcess.registrations.mandatory =
			$.setify(businessProcess.registrations.mandatory($.dbjsObserveMock));
		businessProcess.registrations.optional =
			$.setify(businessProcess.registrations.optional($.dbjsObserveMock));

		// Filter mandatory and optional registration lists
		var anyApplicable = businessProcess.registrations.applicable.size > 0;
		var anyMandatory = anyApplicable && businessProcess.registrations.mandatory.size > 0;

		if (anyMandatory || !anyApplicable) {
			toggleConditionally(mandatoryRegistrationsSection, true);
			if (!anyApplicable) {
				toggleConditionally(mandatoryRegistrationsEmptyMessage, true);
				$.forIn(mandatoryRegistrationsListElements, function (li) {
					li.toggle(businessProcess.registrations.mandatory.has(false));
				});
			} else {
				toggleConditionally(mandatoryRegistrationsEmptyMessage, false);
				$.forIn(mandatoryRegistrationsListElements, function (li, name) {
					li.toggle(businessProcess.registrations.mandatory.has(
						businessProcess.registrations.map[name]
					));
				});
			}
		} else {
			toggleConditionally(mandatoryRegistrationsSection, false);
		}

		if (businessProcess.registrations.optional.size === 0) {
			toggleConditionally(optionalRegistrationsSection, false);
		} else {
			toggleConditionally(optionalRegistrationsSection, true);
			$.forIn(optionalRegistrationsListElements, function (li, name) {
				li.toggle(businessProcess.registrations.optional.has(
					businessProcess.registrations.map[name]
				));
			});
		}
		// -- Second FormFill pass --

		// Clear each registration isRequested
		businessProcess.registrations.map.forEach(function (registration) {
			// One time in a galaxy far far away, isRequested was SetLike!?!
			delete registration.isRequested;
		});

		// Perform dbjsFormFill
		$.dbjsFormFill(businessProcess, guideForm);

		$.refreshGuideHooks.beforeRegistrationsRequested.forEach(function (hook) {
			hook(businessProcess, guideForm);
		});

		// Resolve requested registrations
		businessProcess.registrations.map.forEach(function (registration) {
			registration.isRequested = getPropertyValue(registration, 'isRequested');
		});

		businessProcess.registrations.requested =
			$.setify(businessProcess.registrations.requested($.dbjsObserveMock));

		// Resolve each registration certificates, requirements and costs
		businessProcess.registrations.map.forEach(function (registration) {
			registration.certificates =
					typeof registration.certificates === 'function' ?
						$.setify(registration.certificates($.dbjsObserveMock))
							: registration.certificates;
			registration.requirements =
					typeof registration.requirements === 'function' ?
						$.setify(registration.requirements($.dbjsObserveMock))
							: registration.requirements;
			registration.costs =
					typeof registration.costs === 'function' ?
						$.setify(registration.costs($.dbjsObserveMock)) : registration.costs;
		});
		// Resolve certificates
		businessProcess.certificates.applicable =
			$.setify(businessProcess.certificates.applicable($.dbjsObserveMock));

		// Resolve requirements
		businessProcess.requirements.resolved =
			$.setify(businessProcess.requirements.resolved($.dbjsObserveMock));

		$.refreshGuideHooks.beforeRequirementsApplicable.forEach(function (hook) {
			hook(businessProcess, guideForm);
		});
		// Resolve applicable requirements
		businessProcess.requirements.map.forEach(function (requirement) {
			requirement.isApplicable = getPropertyValue(requirement, 'isApplicable');
		});

		businessProcess.requirements.applicable =
			$.setify(businessProcess.requirements.applicable($.dbjsObserveMock));

		businessProcess.requirements.map.forEach(function (requirement) {
			requirement.label = getPropertyValue(requirement, 'label');
		});

		//Resolve costs
		businessProcess.costs.applicable =
			$.setify(businessProcess.costs.applicable($.dbjsObserveMock));

		businessProcess.costs.map.forEach(function (cost) {
			cost.amount     = getPropertyValue(cost, 'amount');
			cost.sideAmount = getPropertyValue(cost, 'sideAmount');
			cost.label      = getPropertyValue(cost, 'label');
		});

		businessProcess.costs.payable =
			$.setify(businessProcess.costs.payable($.dbjsObserveMock));
		businessProcess.costs.totalAmount = typeof businessProcess.costs.totalAmount === 'function'
			? businessProcess.costs.totalAmount($.dbjsObserveMock) : businessProcess.costs.totalAmount;

		// Filter requirements and costs lists
		$.forIn(requirementsListElements, function (li, name) {
			var enabled = businessProcess.requirements.applicable.has(
				businessProcess.requirements.map[name]
			);

			li.toggle(enabled);
			if (enabled) {
				if (requirementsLabelElements[name]) {
					requirementsLabelElements[name].data = businessProcess.requirements.map[name].label;
				}
			}
		});

		$.forIn(costsListElements, function (li, name) {
			var enabled = businessProcess.costs.payable.has(businessProcess.costs.map[name]);

			li.toggle(enabled);
			if (enabled) {
				if (costsAmountsElements[name]) {
					costsAmountsElements[name].data = formatCurrency(businessProcess.costs.map[name].amount);
				}
				if (costsLabelElements[name]) {
					costsLabelElements[name].data = businessProcess.costs.map[name].label;
				}
			}
		});

		if (costsTotalElement) {
			costsTotalElement.data = formatCurrency(businessProcess.costs.totalAmount);
		}

		// Build costs print link
		if (costsPrintLink) {
			costsPrintLink.search = '';

			businessProcess.costs.payable.forEach(function (cost) {
				buildCostsPrintLink(costsPrintLink, cost, 'amount');
			});

			if (costsPrintLink.search.length) {
				costsPrintLink.search += '&total=' + businessProcess.costs.totalAmount.toFixed(2);
			}

			businessProcess.costs.applicable.forEach(function (cost) {
				if (!cost.sideAmount) return;
				buildCostsPrintLink(costsPrintLink, cost, 'sideAmount', 'side-');
			});
		}

		if (costsSection) {
			if (businessProcess.costs.totalAmount) {
				costsSection.removeClass(zeroCostsClass);
			} else {
				costsSection.addClass(zeroCostsClass);
			}
		}

		toggleConditionally(noRequstedRegistrationsSection,
			!businessProcess.registrations.requested.size);
		toggleConditionally(costsSection, businessProcess.registrations.requested.size);
		toggleConditionally(requirementsSection, businessProcess.registrations.requested.size);
		toggleConditionally(guideSaveButton, businessProcess.registrations.requested.size);

		$.refreshGuideHooks.atEnd.forEach(function (hook) {
			hook(businessProcess, guideForm);
		});
	});
};
