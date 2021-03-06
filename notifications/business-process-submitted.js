'use strict';

var _                = require('mano').i18n.bind('User: Notifications')
  , normalizeOptions = require('es5-ext/object/normalize-options')
  , assign           = require('es5-ext/object/assign')
  , resolveProcesses = require('../business-processes/resolve')
  , _d               = _;

module.exports = function (BusinessProcessClass/*, options*/) {
	var options           = normalizeOptions(arguments[1])
	  , notification      = {}
	  , businessProcesses = resolveProcesses(BusinessProcessClass);

	notification.preTrigger = businessProcesses.filterByKey('guideProgress', 1);
	notification.trigger = businessProcesses.filterByKey('isSubmitted', true);

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
				var doc = requirementUpload.document;

				result.push("- " + _d(doc.label, doc.getTranslations()));
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

	delete options.greeting;
	delete options.signature;

	return assign(notification, options);
};
