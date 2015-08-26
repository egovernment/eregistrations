// Refreshes guide form data.

'use strict';

var camelToHyphen  = require('es5-ext/string/#/camel-to-hyphen')
  , $              = require('mano-legacy')
  , formatCurrency = require('./format-currency');

// Each hook is an array of scripts which are executed in corresponding parts of refresh guide
$.refreshGuideHooks = { atEnd: [], beforeRequirementsApplicable: [] };

require('mano-legacy/get-text-child');

var getNamedListElements = function (listId) {
	var listElement = $(listId), result = {};

	$.forEach(listElement.getElementsByTagName('li'), function (element) {
		var elementDataKey = element.getAttribute('data-key');

		if (element.parentNode !== listElement || !elementDataKey) return;

		result[elementDataKey] = $(element);
	});

	return result;
};

var getPropertyValue = function (target, property) {
	return typeof target[property] === 'function' ? target[property]($.dbjsObserveMock)
		: target[property];
};

// A legacy refreshGuide method for Part A Guide page.
// Used in: /view/guide.js
module.exports = $.refreshGuide = function (guideFormId, businessProcessId,
		businessProcessTypeName) {
	var guideForm = $(guideFormId)
	  , mandatoryRegistrationsSection, mandatoryRegistrationsListElements
	  , optionalRegistrationsSection, optionalRegistrationsListElements
	  , requirementsListElements
	  , costsListElements, costsAmountsElements = {}, costsTotalElement, costsPrintLink;

	// Create mock BusinessProcess
	var BusinessProcess = function () {};
	BusinessProcess.prototype = $.legacyDb[businessProcessTypeName].prototype;

	// Gather required list elements

	mandatoryRegistrationsSection = $('mandatory-registrations-section');
	mandatoryRegistrationsListElements = getNamedListElements('mandatory-registrations-list');
	optionalRegistrationsSection = $('optional-registrations-section');
	optionalRegistrationsListElements = getNamedListElements('optional-registrations-list');
	requirementsListElements = getNamedListElements('requirements-list');
	costsListElements = getNamedListElements('costs-list');
	costsPrintLink = $('print-costs-link');

	$.forIn(costsListElements, function (li, name) {
		costsAmountsElements[name] = $.getTextChild('cost-amount-' + camelToHyphen.call(name));
	});

	costsTotalElement = $.getTextChild('costs-total');

	// Crazy train...
	$.onEnvUpdate(guideForm, function () {
		// Create mock business process
		var businessProcess = new BusinessProcess();
		businessProcess.__id__ = businessProcessId;

		// -- First FormFill pass --

		// Perform dbjsFormFill
		$.dbjsFormFill(businessProcess, guideForm);

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
		if (businessProcess.registrations.mandatory.size === 0) {
			mandatoryRegistrationsSection.toggle(false);
		} else {
			mandatoryRegistrationsSection.toggle(true);
			$.forIn(mandatoryRegistrationsListElements, function (li, name) {
				li.toggle(businessProcess.registrations.mandatory.has(
					businessProcess.registrations.map[name]
				));
			});
		}

		if (businessProcess.registrations.optional.size === 0) {
			optionalRegistrationsSection.toggle(false);
		} else {
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

		// Resolve requested registrations
		businessProcess.registrations.requested =
			$.setify(businessProcess.registrations.requested($.dbjsObserveMock));

		// Resolve each registration certificates, requirements and costs
		businessProcess.registrations.map.forEach(function (registration) {
			registration.certificates = $.setify(registration.certificates($.dbjsObserveMock));
			registration.requirements = $.setify(registration.requirements($.dbjsObserveMock));
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
			hook(businessProcess);
		});
		// Resolve applicable requirements
		businessProcess.requirements.map.forEach(function (requirement) {
			requirement.isApplicable = getPropertyValue(requirement, 'isApplicable');
		});

		businessProcess.requirements.applicable =
			$.setify(businessProcess.requirements.applicable($.dbjsObserveMock));
		// Filter requirements and costs lists
		$.forIn(requirementsListElements, function (li, name) {
			li.toggle(businessProcess.requirements.applicable.has(
				businessProcess.requirements.map[name]
			));
		});

		//Resolve costs
		businessProcess.costs.applicable =
			$.setify(businessProcess.costs.applicable($.dbjsObserveMock));

		businessProcess.costs.map.forEach(function (cost) {
			cost.amount = getPropertyValue(cost, 'amount');
		});

		businessProcess.costs.payable =
			$.setify(businessProcess.costs.payable($.dbjsObserveMock));
		businessProcess.costs.totalAmount = typeof businessProcess.costs.totalAmount === 'function'
			? businessProcess.costs.totalAmount($.dbjsObserveMock) : businessProcess.costs.totalAmount;

		$.forIn(costsListElements, function (li, name) {
			var enabled = businessProcess.costs.payable.has(businessProcess.costs.map[name]);

			li.toggle(enabled);
			if (enabled && costsAmountsElements[name]) {
				costsAmountsElements[name].data = formatCurrency(businessProcess.costs.map[name].amount);
			}
		});

		costsTotalElement.data = formatCurrency(businessProcess.costs.totalAmount);

		// Build costs print link
		costsPrintLink.search = '';

		businessProcess.costs.payable.forEach(function (cost) {
			costsPrintLink.search += (costsPrintLink.search.length) ?
					'&' + cost.key + '=' + cost.amount.toFixed(2) :
					'?' + cost.key + '=' + cost.amount.toFixed(2);
		});

		if (costsPrintLink.search.length) {
			costsPrintLink.search += '&total=' + businessProcess.costs.totalAmount.toFixed(2);
		}
		$.refreshGuideHooks.atEnd.forEach(function (hook) {
			hook(businessProcess);
		});
	});
};
