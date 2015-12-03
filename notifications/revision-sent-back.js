'use strict';

var _ = require('mano').i18n.bind('Official: Revision: Notifications');

var businessProcessInstances = require('mano').db.BusinessProcess.instances
	.filterByKey('isFromEregistrations', true);

exports.trigger = businessProcessInstances
	.filterByKeyPath('processingSteps/map/revision/isSentBack', true);
exports.preTrigger = businessProcessInstances
	.filterByKeyPath('processingSteps/map/revision/isReady', true);

exports.subject = _("M05 You must correct some elements in your application");
exports.text = _("Email message greeting ${ fullName }") + "\n\n"
	+ _("M05 Revision sent back\n\n" + "Name of company: ${ businessName }\n\n${ rejectedUploads }") +
	"\n\n" + _("Email message signature") + "\n";

exports.resolveGetters = true;

exports.variables = {
	fullName: function () {
		return this.businessProcess.user.fullName;
	},
	businessName: function () {
		return this.businessProcess.businessName;
	},
	rejectedUploads: function () {
		var result = [];
		if (this.businessProcess.requirementUploads.rejected.size) {
			result.push(_("Issues with uploaded documents:"));
			this.businessProcess.requirementUploads.rejected.forEach(function (requirementUpload) {
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
		if (this.businessProcess.paymentReceiptUploads.rejected.size) {
			result.push(_("Issues with uploaded payment receipts:"));
			this.businessProcess.paymentReceiptUploads.rejected.forEach(function (paymentReceiptUpload) {
				result.push("- " + paymentReceiptUpload.document.label);
				result.push("    " + paymentReceiptUpload.rejectReasonMemo);
			});
		}
		return result.join('\n');
	}
};
