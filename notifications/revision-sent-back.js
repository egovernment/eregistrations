'use strict';

var _                = require('mano').i18n.bind('Official: Revision: Notifications')
  , normalizeOptions = require('es5-ext/object/normalize-options')
  , assign           = require('es5-ext/object/assign')
  , resolveProcesses = require('../business-processes/resolve')
  , _d               = _;

module.exports = function (BusinessProcessClass/*, options*/) {
	var options           = normalizeOptions(arguments[1])
	  , stepName          = options.stepName || 'revision'
	  , stepKeyPath       = 'processingSteps/map/' + stepName
	  , notification      = {}
	  , businessProcesses = resolveProcesses(BusinessProcessClass);

	notification.trigger = businessProcesses.filterByKeyPath(stepKeyPath + '/isSentBack', true);
	notification.preTrigger = businessProcesses.filterByKeyPath(stepKeyPath + '/isReady', true);

	notification.subject = _("M05 You must correct some elements in your application");
	notification.text = _("M05 Revision sent back\n\n"
			+ "Name of company: ${ businessName }\n\n"
			+ "${ rejectedUploads }");

	if (options.greeting == null) {
		notification.text = _("Email message greeting ${ fullName }") + "\n\n" + notification.text;
	}
	if (options.greeting) notification.text = options.greeting + "\n\n" + notification.text;

	if (options.signature == null) notification.text += "\n\n" + _("Email message signature") + "\n";
	if (options.signature) notification.text += "\n\n" + options.signature + "\n";

	notification.resolveGetters = true;

	notification.variables = {
		fullName: function () {
			return this.businessProcess.user.fullName;
		},
		businessName: function () {
			return this.businessProcess.businessName;
		},
		rejectedUploads: function () {
			var processingStep        = this.businessProcess.processingSteps.map[stepName]
			  , paymentReceiptUploads = processingStep.paymentReceiptUploads
			  , requirementUploads    = processingStep.requirementUploads
			  , dataForms             = this.businessProcess.dataForms
			  , result                = [];

			if (requirementUploads.rejected.size) {
				result.push(_("Issues with uploaded documents:"));
				requirementUploads.rejected.forEach(function (requirementUpload) {
					var rejectReasons = requirementUpload.rejectReasons
					  , doc           = requirementUpload.document;

					result.push("- " + _d(doc.label, doc.getTranslations()));
					if (rejectReasons.size > 1) {
						rejectReasons.forEach(function (reason) {
							result.push("    - " + reason);
						});
					} else {
						result.push("    " + rejectReasons.first);
					}
				});
			}
			if (paymentReceiptUploads.rejected.size) {
				result.push(_("Issues with uploaded payment receipts:"));
				paymentReceiptUploads.rejected.forEach(function (paymentReceiptUpload) {
					result.push("- " + paymentReceiptUpload.document.label);
					result.push("    " + paymentReceiptUpload.rejectReasonMemo);
				});
			}
			if (dataForms.isRejected) {
				result.push(_("Issues with data forms:"));
				result.push(dataForms.rejectReason);
			}
			return result.join('\n');
		}
	};

	delete options.stepName;
	delete options.greeting;
	delete options.signature;

	return assign(notification, options);
};
