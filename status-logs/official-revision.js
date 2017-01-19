'use strict';

var _                = require('mano').i18n.bind('Official: Revision: Status Log')
  , normalizeOptions = require('es5-ext/object/normalize-options')
  , resolveProcesses = require('../business-processes/resolve')
  , _d               = _;

module.exports = function (BusinessProcessClass/*, options*/) {
	var options           = normalizeOptions(arguments[1])
	  , stepName          = options.stepName || 'revision'
	  , stepKeyPath       = 'processingSteps/map/' + stepName
	  , processorKeyPath  = stepKeyPath + '/processor'
	  , label             = options.label || _("Review")
	  , businessProcesses = resolveProcesses(BusinessProcessClass);

	var readyProcesses = businessProcesses.filterByKeyPath(stepKeyPath + '/isReady', true);
	var approvedProcesses = businessProcesses.filterByKeyPath(stepKeyPath + '/isApproved', true);
	var sentBackProcesses = businessProcesses.filterByKeyPath(stepKeyPath + '/isSentBack', true);
	var correctedProcesses = businessProcesses.filterByKeyPath(stepKeyPath + '/isPending', true);
	var rejectedProcesses = businessProcesses.filterByKeyPath(stepKeyPath + '/isRejected', true);

	return [{
		id: 'approved',
		trigger: approvedProcesses,
		preTrigger: readyProcesses,
		official: processorKeyPath,
		label: label,
		text: options.approvedText || _("Review successful")
	}, {
		id: 'sentBack',
		trigger: sentBackProcesses,
		preTrigger: readyProcesses,
		official: processorKeyPath,
		label: label,
		text: options.sentBackText || _("Necessary corrections in the file.\n ${ rejectedUploads }"),
		variables: {
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
						rejectReasons.forEach(function (reason) {
							result.push("    - " + reason);
						});
					});
					result.push('');
				}
				if (paymentReceiptUploads.rejected.size) {
					result.push(_("Issues with uploaded payment receipts:"));
					paymentReceiptUploads.rejected.forEach(function (paymentReceiptUpload) {
						result.push("- " + paymentReceiptUpload.document.label);
						result.push("    - " + paymentReceiptUpload.rejectReasonMemo);
					});
					result.push('');
				}
				if (dataForms.isRejected) {
					result.push(_("Issues with data forms:"));
					result.push(dataForms.rejectReason);
				}
				return result.join('\n');
			}
		},
		resolveGetters: true
	}, {
		id: 'correction',
		trigger: correctedProcesses,
		preTrigger: sentBackProcesses,
		label: _("Correction of documents"),
		text: _("Corrected documents sent to review")
	}, {
		id: 'rejected',
		trigger: rejectedProcesses,
		preTrigger: readyProcesses,
		official: processorKeyPath,
		label: label,
		text: options.rejectedText || (_("Application rejected.\n" +
			"After reviewing the information and documents, the validation request can not be " +
			"processed for the following reason:\n${ rejectionReason }")),
		variables: {
			rejectionReason: function () {
				return this.businessProcess.processingSteps.map[stepName].rejectionReason;
			}
		},
		resolveGetters: true
	}];
};
