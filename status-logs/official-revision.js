'use strict';

var _ = require('mano').i18n.bind('Official: Revision: Status Log')
  , BusinessProcess = require('../../../model/business-process/base');

module.exports = function (stepName) {
	var businessProcessInstances = require('mano').db.BusinessProcess.instances
		.filterByKey('isFromEregistrations', true);

	stepName = stepName || 'revision';

	var readyBusinessProcesses = businessProcessInstances
		.filterByKeyPath('processingSteps/map/' + stepName + '/isReady', true);

	var approvedBusinessProcesses = businessProcessInstances
		.filterByKeyPath('processingSteps/map/' + stepName + '/isApproved', true);

	var sentBackBusinessProcesses = businessProcessInstances
		.filterByKeyPath('processingSteps/map/' + stepName + '/isSentBack', true);

	var correctedBusinessProcesses = businessProcessInstances
		.filterByKeyPath('processingSteps/map/' + stepName + '/status', null);

	var rejectedBusinessProcesses = businessProcessInstances
		.filterByKeyPath('processingSteps/map/' + stepName + '/isRejected', true);

	return [{
		BusinessProcessType: BusinessProcess,
		trigger: approvedBusinessProcesses,
		preTrigger: readyBusinessProcesses,
		official: 'processingSteps/map/' + stepName + '/processor',
		label: _("Review"),
		text: _("Review successful")
	}, {
		BusinessProcessType: BusinessProcess,
		trigger: sentBackBusinessProcesses,
		preTrigger: readyBusinessProcesses,
		official: 'processingSteps/map/' + stepName + '/processor',
		label: _("Review"),
		text: _("Necessary corrections in the file")
	}, {
		BusinessProcessType: BusinessProcess,
		trigger: correctedBusinessProcesses,
		preTrigger: sentBackBusinessProcesses,
		official: 'processingSteps/map/' + stepName + '/processor',
		label: _("Correction of documents"),
		text: _("Corrected documents sent to review")
	}, {
		BusinessProcessType: BusinessProcess,
		trigger: rejectedBusinessProcesses,
		preTrigger: readyBusinessProcesses,
		official: 'processingSteps/map/' + stepName + '/processor',
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
