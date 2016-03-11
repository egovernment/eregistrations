'use strict';

var _                = require('mano').i18n.bind('User: Notifications')
  , normalizeOptions = require('es5-ext/object/normalize-options')
  , ensureType       = require('dbjs/valid-dbjs-type')
  , isFalsy          = require('eregistrations/utils/is-falsy');

module.exports = function (BusinessProcessClass/*, options*/) {
	var options      = normalizeOptions(arguments[1])
	  , notification = {}
	  , businessProcesses;

	ensureType(BusinessProcessClass);

	if (!BusinessProcessClass.database.BusinessProcess.isPrototypeOf(BusinessProcessClass)) {
		throw new Error(BusinessProcessClass + ' is expected to extend BusinessProcess');
	}

	businessProcesses = BusinessProcessClass.instances.filterByKey('isFromEregistrations', true)
		.filterByKey('isDemo', isFalsy);

	notification.trigger = businessProcesses.filterByKey('guideProgress', 1);
	notification.preTrigger = businessProcesses.filterByKey('isSubmitted', true);

	notification.resolveGetters = true;

	notification.variables = {
		fullName: function () {
			return this.businessProcess.user.fullName;
		},
		registrations: function () {
			var result = [];
			this.businessProcess.registrations.requested.forEach(function (registration) {
				result.push("- " + registration.label);
			});
			return result.join("\n");
		},
		requirements: function () {
			var result = [];
			this.businessProcess.requirementUploads.applicable.forEach(function (requirementUpload) {
				result.push("- " + requirementUpload.document.label);
			});
			return result.join("\n");
		},
		nameOfCompany: function () {
			return this.businessProcess.businessName;
		}
	};

	notification.subject = _("M02 Your application for registration has been received");
	notification.text = _("M02 Application send\n\n" + "Name of company: ${ nameOfCompany }\n\n"
			+ "Registrations: ${ registrations }\n\n"
			+ "Requirements: ${ requirements }");

	if (options.greeting == null) {
		notification.text = _("Email message greeting ${ fullName }") + "\n\n" + notification.text;
	}
	if (options.greeting) notification.text = options.greeting + "\n\n" + notification.text;

	if (options.signature == null) notification.text += "\n\n" + _("Email message signature") + "\n";
	if (options.signature) notification.text += "\n\n" + options.signature + "\n";

	return notification;
};
