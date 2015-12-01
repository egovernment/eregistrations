'use strict';

var _ = require('mano').i18n.bind('Official: Revision: Status Log')
  , BusinessProcess = require('../../../model/business-process/base');

var businessProcessInstances = require('mano').db.BusinessProcess.instances
	.filterByKey('isFromEregistrations', true);

var readyBusinessProcesses = businessProcessInstances
	.filterByKeyPath('processingSteps/map/revision/isReady', true);

var approvedBusinessProcesses = businessProcessInstances
	.filterByKeyPath('processingSteps/map/revision/isApproved', true);

var sentBackBusinessProcesses = businessProcessInstances
	.filterByKeyPath('processingSteps/map/revision/isSentBack', true);

var correctedBusinessProcesses = businessProcessInstances
	.filterByKeyPath('processingSteps/map/revision/status', null);

var rejectedBusinessProcesses = businessProcessInstances
	.filterByKeyPath('processingSteps/map/revision/isRejected', true);

module.exports = [{
	BusinessProcessType: BusinessProcess,
	trigger: approvedBusinessProcesses,
	preTrigger: readyBusinessProcesses,
	official: 'processingSteps/map/revision/processor',
	label: _("Review"),
	text: _("Review successful")
}, {
	BusinessProcessType: BusinessProcess,
	trigger: sentBackBusinessProcesses,
	preTrigger: readyBusinessProcesses,
	official: 'processingSteps/map/revision/processor',
	label: _("Review"),
	text: _("Necessary corrections in the file")
}, {
	BusinessProcessType: BusinessProcess,
	trigger: correctedBusinessProcesses,
	preTrigger: sentBackBusinessProcesses,
	official: 'processingSteps/map/revision/processor',
	label: _("Correction of documents"),
	text: _("Corrected documents sent to review")
}, {
	BusinessProcessType: BusinessProcess,
	trigger: rejectedBusinessProcesses,
	preTrigger: readyBusinessProcesses,
	official: 'processingSteps/map/revision/processor',
	label: _("Review"),
	text: _("Application rejected.\n" +
		"After reviewing the information and documents, the validation request can not be processed " +
		"for the following reason:\n${ rejectionReason }"),
	variables: {
		rejectionReason: function () {
			return this.businessProcess.processingSteps.map.revision.rejectionReason;
		}
	},
	resolveGetters: true
}];
