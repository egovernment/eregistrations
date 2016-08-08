'use strict';

var db               = require('mano').db
  , _                = require('mano').i18n.bind("Certificate status log")
  , assign           = require('es5-ext/object/assign')
  , normalizeOptions = require('es5-ext/object/normalize-options')
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
		var certificate = businessProcess.resolveSKeyPath(conf.certificatePath), statusLogProperties;
		if (!certificate) return;
		certificate = certificate.value;
		if (!businessProcess.certificates.applicable.has(certificate)) return;
		statusLogProperties = {
			time: new Date(),
			text: conf.statusText
		};

		certificate.statusLog.map.newUniq(statusLogProperties);
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
		statusText: _("Certificate was issued"),
		label: _("Approved")
	},
	{
		preTriggerValue: 'pending',
		triggerValue: 'rejected',
		statusText: _("Certificate request was rejected"),
		label: _("Rejected")
	}
];

var isSubmittedConfig = {
	triggerPath: 'isSubmitted',
	preTriggerValue: null,
	triggerValue: true,
	statusText: _("Certificate request received"),
	label: _("Submission")
};

var withdrawalConfig = {
	preTriggerValue: null,
	triggerValue: true,
	// will be resolved to full path
	triggerPath: 'wasHanded',
	statusText: _("Certificate was withdrawn"),
	label: _("Withdraw")
};

module.exports = function () {
	db.BusinessProcess.extensions.forEach(function (BusinessProcessType) {
		if (!BusinessProcessType.prototype.certificates.map.size) return;
		businessProcesses = BusinessProcessType.instances
			.filterByKey('isFromEregistrations', true).filterByKey('isDemo',
				false);
		businessProcessesSubmitted = businessProcesses.filterByKey('isSubmitted', true);

		BusinessProcessType.prototype.certificates.map.forEach(function (certificate) {
			var basePath = certificate.__id__.slice(certificate.__id__.indexOf('/') + 1);
			statusConfigs.forEach(function (config) {
				setupCertLogTrigger(assign(config, {
					BusinessProcessType: BusinessProcessType,
					collection: businessProcessesSubmitted,
					certificatePath: basePath,
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
				certificatePath: basePath,
				triggerPath: basePath + withdrawalConfig.triggerPath
			}));
		});
	});
};
