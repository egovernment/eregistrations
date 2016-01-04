'use strict';

var _ = require('mano').i18n.bind('Official: Revision: Notifications');

module.exports = function (stepName) {
	var businessProcessInstances = require('mano').db.BusinessProcess.instances
		.filterByKey('isFromEregistrations', true)
	  , notification = {};

	stepName = stepName || 'revision';

	notification.trigger = businessProcessInstances
		.filterByKeyPath('processingSteps/map/' + stepName + '/isSentBack', true);
	notification.preTrigger = businessProcessInstances
		.filterByKeyPath('processingSteps/map/' + stepName + '/isReady', true);

	notification.subject = _("M05 You must correct some elements in your application");
	notification.text = _("Email message greeting ${ fullName }\n\n")
		+ _("M05 Revision sent back\n\n"
			+ "Name of company: ${ businessName }\n\n"
			+ "${ rejectedUploads }\n\n")
		+ _("Email message signature") + "\n";

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
