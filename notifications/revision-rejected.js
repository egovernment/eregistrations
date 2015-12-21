'use strict';

var _ = require('mano').i18n.bind('Official: Revision: Notifications');

module.exports = function (stepName) {
	var businessProcessInstances = require('mano').db.BusinessProcess.instances
		.filterByKey('isFromEregistrations', true)
	  , notification = {};

	stepName = stepName || 'revision';

	notification.trigger = businessProcessInstances
		.filterByKeyPath('processingSteps/map/' + stepName + '/isRejected', true);
	notification.preTrigger = businessProcessInstances
		.filterByKeyPath('processingSteps/map/' + stepName + '/isReady', true);

	notification.resolveGetters = true;

	notification.variables = {
		fullName: function () {
			return this.businessProcess.user.fullName;
		},
		businessName: function () {
			return this.businessProcess.businessName;
		},
		rejectionReason: function () {
			return this.businessProcess.processingSteps.map[stepName].rejectionReason;
		}
	};

	notification.subject = _("M19 Your request has been rejected");
	notification.text = _("Email message greeting ${ fullName }\n\n")
		+ _("M19 Revision rejected\n\n"
			+ "Name of company: ${ businessName }\n\n"
			+ "${ rejectionReason }") + "\n\n"
		+ _("Email message signature") + "\n";

	return notification;
};
