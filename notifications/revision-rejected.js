'use strict';

var _ = require('mano').i18n.bind('Official: Revision: Notifications');

var businessProcessInstances = require('mano').db.BusinessProcess.instances
	.filterByKey('isFromEregistrations', true);

exports.trigger = businessProcessInstances
	.filterByKeyPath('processingSteps/map/revision/isRejected', true);
exports.preTrigger = businessProcessInstances
	.filterByKeyPath('processingSteps/map/revision/isReady', true);

exports.resolveGetters = true;

exports.variables = {
	fullName: function () {
		return this.businessProcess.user.fullName;
	},
	businessName: function () {
		return this.businessProcess.businessName;
	},
	rejectionReason: function () {
		return this.businessProcess.processingSteps.map.revision.rejectionReason;
	}
};

exports.subject = _("M19 Your request has been rejected");
exports.text = _("Email message greeting ${ fullName }") + "\n\n"
	+ _("M19 Revision rejected\n\n" + "Name of company: ${ businessName }\n\n${ rejectionReason }")
	+ "\n\n" +
	_("Email message signature") + "\n";
