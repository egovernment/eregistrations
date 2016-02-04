'use strict';

var _ = require('mano').i18n.bind('Official: Revision: Status Log')
  , BusinessProcess = require('../../../model/business-process/base');

module.exports = function (stepName, businessProcesses) {
	var stepKeyPath, processorKeyPath;

	stepName = stepName || 'revision';
	stepKeyPath = 'processingSteps/map/' + stepName;
	processorKeyPath =  stepKeyPath + '/processor';

	var readyProcesses = businessProcesses.filterByKeyPath(stepKeyPath + '/isReady', true);
	var approvedProcesses = businessProcesses.filterByKeyPath(stepKeyPath + '/isApproved', true);
	var sentBackProcesses = businessProcesses.filterByKeyPath(stepKeyPath + '/isSentBack', true);
	var correctedProcesses = businessProcesses.filterByKeyPath(stepKeyPath + '/status', null);
	var rejectedProcesses = businessProcesses.filterByKeyPath(stepKeyPath + '/isRejected', true);

	return [{
		id: 'approved',
		BusinessProcessType: BusinessProcess,
		trigger: approvedProcesses,
		preTrigger: readyProcesses,
		official: processorKeyPath,
		label: _("Review"),
		text: _("Review successful")
	}, {
		id: 'sentBack',
		BusinessProcessType: BusinessProcess,
		trigger: sentBackProcesses,
		preTrigger: readyProcesses,
		official: processorKeyPath,
		label: _("Review"),
		text: _("Necessary corrections in the file")
	}, {
		id: 'correction',
		BusinessProcessType: BusinessProcess,
		trigger: correctedProcesses,
		preTrigger: sentBackProcesses,
		label: _("Correction of documents"),
		text: _("Corrected documents sent to review")
	}, {
		id: 'rejected',
		BusinessProcessType: BusinessProcess,
		trigger: rejectedProcesses,
		preTrigger: readyProcesses,
		official: processorKeyPath,
		label: _("Review"),
		text: _("Application rejected.\n" +
			"After reviewing the information and documents, the validation request can not be " +
			"processed for the following reason:\n${ rejectionReason }"),
		variables: {
			rejectionReason: function () {
				return this.businessProcess.processingSteps.map[stepName].rejectionReason;
			}
		},
		resolveGetters: true
	}];
};
