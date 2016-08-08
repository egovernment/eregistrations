'use strict';

var db = require('mano').db
  , setupCertLogTrigger
  , businessProcessesSubmitted
  , setupTriggers = require('../_setup-triggers');

setupCertLogTrigger = function (conf) {
	setupTriggers({
		preTrigger: conf.preTriggerValue ?
				conf.collection.filterByKeyPath(conf.triggerPath, conf.preTriggerValue) : null,
		trigger: conf.collection.filterByKeyPath(conf.triggerPath, conf.triggerValue)
	}, function (businessProcess) {
		var certificate = businessProcess.resolveSKeyPath(conf.certificatePath), statusLogProperties;
		if (!certificate) return;
		if (!businessProcess.certificates.applicable.has(certificate)) return;
		statusLogProperties = {
			time: new Date(),
			text: conf.statusText
		};
		certificate.statusLog.map.newUniq(statusLogProperties);
	});
};

module.exports = function () {
	db.BusinessProcess.extensions.forEach(function (BusinessProcessType) {
		if (!BusinessProcessType.prototype.certificates.map.size) return;
		businessProcessesSubmitted = BusinessProcessType.instances
			.filterByKey('isFromEregistrations', true).filterByKey('isDemo',
				false).filterByKey('isSubmitted', true);

		BusinessProcessType.prototype.certificates.map.forEach(function (certificate) {
			var basePath = certificate.__id__.slice(certificate.__id__.indexOf('/'));
			setupCertLogTrigger({
				collection: businessProcessesSubmitted,
				triggerPath: basePath + '/status',
				preTriggerValue: null,
				triggerValue: 'pending'
			});
		});
	});
};
