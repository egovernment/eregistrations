'use strict';

var _                = require('mano').i18n.bind('Official: Revision: Status Log')
  , normalizeOptions = require('es5-ext/object/normalize-options')
  , resolveProcesses = require('../business-processes/resolve');

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
		text: options.sentBackText || _("Necessary corrections in the file")
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
