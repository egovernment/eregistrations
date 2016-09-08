'use strict';

var _                = require('mano').i18n.bind('Official: Revision: Notifications')
  , normalizeOptions = require('es5-ext/object/normalize-options')
  , assign           = require('es5-ext/object/assign')
  , resolveProcesses = require('../business-processes/resolve');

module.exports = function (BusinessProcessClass/*, options*/) {
	var options           = normalizeOptions(arguments[1])
	  , stepName          = options.stepName || 'revision'
	  , stepKeyPath       = 'processingSteps/map/' + stepName
	  , notification      = {}
	  , businessProcesses = resolveProcesses(BusinessProcessClass);

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
	notification.text = _("M19 Revision rejected\n\n"
			+ "Name of company: ${ businessName }\n\n"
			+ "${ rejectionReason }");

	if (options.greeting == null) {
		notification.text = _("Email message greeting ${ fullName }") + "\n\n" + notification.text;
	}
	if (options.greeting) notification.text = options.greeting + "\n\n" + notification.text;

	if (options.signature == null) notification.text += "\n\n" + _("Email message signature") + "\n";
	if (options.signature) notification.text += "\n\n" + options.signature + "\n";

	delete options.stepName;
	delete options.greeting;
	delete options.signature;

	return assign(notification, options);
};
