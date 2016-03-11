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

	notification.trigger = businessProcesses.filterByKeyPath(stepKeyPath + '/isRejected', true);
	notification.preTrigger = businessProcesses.filterByKeyPath(stepKeyPath + '/isReady', true);

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
			+ "${ rejectionReason }");

	if (options.signature == null) notification.text += "\n\n" + _("Email message signature") + "\n";
	if (options.signature) notification.text += options.signature;

	return notification;
};
