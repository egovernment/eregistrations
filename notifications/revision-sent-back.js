'use strict';

var _                = require('mano').i18n.bind('Official: Revision: Notifications')
  , normalizeOptions = require('es5-ext/object/normalize-options')
  , ensureType       = require('dbjs/valid-dbjs-type');

module.exports = function (BusinessProcessClass/*, options*/) {
	var options           = normalizeOptions(arguments[1])
	  , stepName          = options.stepName || 'revision'
	  , stepKeyPath       = 'processingSteps/map/' + stepName
	  , notification      = {}
	  , businessProcesses;

	ensureType(BusinessProcessClass);

	if (!BusinessProcessClass.database.BusinessProcess.isPrototypeOf(BusinessProcessClass)) {
		throw new Error(BusinessProcessClass + ' is expected to extend BusinessProcess');
	}

	businessProcesses = BusinessProcessClass.instances.filterByKey('isFromEregistrations', true);

	notification.trigger = businessProcesses.filterByKeyPath(stepKeyPath + '/isSentBack', true);
	notification.preTrigger = businessProcesses.filterByKeyPath(stepKeyPath + '/isReady', true);

	notification.subject = _("M05 You must correct some elements in your application");
	notification.text = _("M05 Revision sent back\n\n"
			+ "Name of company: ${ businessName }\n\n"
			+ "${ rejectedUploads }");

	if (options.greeting == null) notification.text = _("Email message greeting ${ fullName }")
		+ "\n\n" + notification.text;
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
			  , result                = [];

			if (requirementUploads.rejected.size) {
				result.push(_("Issues with uploaded documents:"));
				requirementUploads.rejected.forEach(function (requirementUpload) {
					result.push("- " + requirementUpload.document.label);
					if (requirementUpload.rejectReasons.size > 1) {
						requirementUpload.rejectReasons.forEach(function (reason) {
							result.push("    - " + reason);
						});
					} else {
						result.push("    " + requirementUpload.rejectReasons.first);
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
			return result.join('\n');
		}
	};

	return notification;
};
