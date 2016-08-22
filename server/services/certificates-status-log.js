'use strict';

var _                = require('mano').i18n.bind("Certificate status log")
  , assign           = require('es5-ext/object/assign')
  , normalizeOptions = require('es5-ext/object/normalize-options')
  , ensureDb         = require('dbjs/valid-dbjs')
  , resolveInstances = require('../../business-processes/resolve')
  , setupCertLogTrigger
  , businessProcesses
  , businessProcessesSubmitted
  , setupTriggers = require('../_setup-triggers');

setupCertLogTrigger = function (config) {
	var conf = normalizeOptions(config);
	setupTriggers({
		BusinessProcessType: conf.BusinessProcessType,
		preTrigger: conf.collection.filterByKeyPath(conf.triggerPath, conf.preTriggerValue),
		trigger: conf.collection.filterByKeyPath(conf.triggerPath, conf.triggerValue)
	}, function (businessProcess) {
		var certificate = businessProcess.resolveSKeyPath(conf.certificatePath)
		  , statusLog, statusLogProperties, official;
		if (!certificate) return;
		certificate = certificate.value;
		if (!businessProcess.certificates.applicable.has(certificate)) return;
		statusLog = certificate.statusLog.map.newUniq();
		statusLogProperties = {
			time: new Date(),
			text: conf.statusText,
			label: conf.label
		};
		if (conf.officialPath) {
			official = businessProcess.resolveSKeyPath(conf.officialPath);
			if (official && official.value) {
				statusLogProperties.official = official.value;
			}
		} else if (typeof conf.getOfficial === 'function') {
			official = conf.getOfficial(certificate);
			if (official) {
				statusLogProperties.official = official;
			}
		}

		statusLog.setProperties(statusLogProperties);
	});
};

var statusConfigs = [
	{
		preTriggerValue: null,
		triggerValue: 'pending',
		statusText: _("Certificate is ready for processing"),
		label: _("Pending")
	},
	{
		preTriggerValue: 'pending',
		triggerValue: 'approved',
		// will be resolved to full path (relative to cert)
		officialPath: 'processingStep/processor',
		statusText: _("Certificate was issued"),
		label: _("Approved")
	}
];

var isSubmittedConfig = {
	triggerPath: 'isSubmitted',
	preTriggerValue: false,
	triggerValue: true,
	statusText: _("Certificate request received"),
	label: _("Submission")
};

var rejectionConfig = {
	triggerPath: 'isRejected',
	preTriggerValue: false,
	triggerValue: true,
	getOfficial: function (certificate) {
		var official;
		certificate.master.processingSteps.applicable.some(function (step) {
			if (step.isRejected) {
				official = step.processor;
				return true;
			}
		});
		return official;
	},
	statusText: _("Certificate request was rejected"),
	label: _("Rejected")
};

var withdrawalConfig = {
	preTriggerValue: false,
	triggerValue: true,
	triggerPath: 'processingSteps/map/frontDesk/isApproved',
	officialPath: 'processingSteps/map/frontDesk/processor',
	statusText: _("Certificate was withdrawn"),
	label: _("Withdraw")
};

module.exports = function (db) {
	ensureDb(db);
	db.BusinessProcess.extensions.forEach(function (BusinessProcessType) {
		if (!BusinessProcessType.prototype.certificates.map.size) return;
		businessProcesses = resolveInstances(BusinessProcessType);
		businessProcessesSubmitted = businessProcesses.filterByKey('isSubmitted', true);

		BusinessProcessType.prototype.certificates.map.forEach(function (certificate) {
			var basePath = certificate.__id__.slice(certificate.__id__.indexOf('/') + 1);
			statusConfigs.forEach(function (config) {
				setupCertLogTrigger(assign(config, {
					BusinessProcessType: BusinessProcessType,
					collection: businessProcessesSubmitted,
					certificatePath: basePath,
					officialPath: config.officialPath ? basePath + '/'
							+ config.officialPath : null,
					triggerPath: basePath + '/status'
				}));
			});
			setupCertLogTrigger(assign(isSubmittedConfig, {
				BusinessProcessType: BusinessProcessType,
				collection: businessProcesses,
				certificatePath: basePath
			}));
			setupCertLogTrigger(assign(withdrawalConfig, {
				BusinessProcessType: BusinessProcessType,
				collection: businessProcessesSubmitted,
				certificatePath: basePath
			}));
			setupCertLogTrigger(assign(rejectionConfig, {
				BusinessProcessType: BusinessProcessType,
				collection: businessProcessesSubmitted,
				certificatePath: basePath
			}));
		});
	});
};
