'use strict';

var resolveProcessingStepFullPath = require('../../utils/resolve-processing-step-full-path')
  , normalizeOptions = require('es5-ext/object/normalize-options')
  , capitalize       = require('es5-ext/string/#/capitalize')
  , includes         = require('es5-ext/array/#/contains')
  , unserializeValue = require('dbjs/_setup/unserialize/value')
  , ensureString     = require('es5-ext/object/validate-stringifiable-value')
  , deferred         = require('deferred');

module.exports = function (driver, processingStepsMeta/*, options */) {
	var businessProcessesBySteps = {}, options, serviceName;
	options = normalizeOptions(arguments[2]);
	if (options.serviceName) {
		serviceName = ensureString(options.serviceName);
	}
	return deferred.map(Object.keys(processingStepsMeta), function (stepMetaKey) {
		var stepPath, stepName, storages, services;
		services = processingStepsMeta[stepMetaKey]._services;
		stepName = resolveProcessingStepFullPath(stepMetaKey);
		if (serviceName) {
			if (!includes.call(serviceName, services)) {
				return;
			}
			services = [serviceName];
		}
		storages = services.map(function (storageName) {
			return driver.getStorage('businessProcess' + capitalize.call(storageName));
		});
		stepPath = 'processingSteps/map/' + stepName;

		return deferred.map(storages, function (storage) {
			return storage.search({ keyPath: stepPath + '/status' }, function (id, data) {
				var value;
				value = unserializeValue(data.value);
				if (value !== 'approved' && value !== 'rejected') return;
				if (!businessProcessesBySteps[stepName]) {
					businessProcessesBySteps[stepName] = [];
				}
				businessProcessesBySteps[stepName].push({ id: id, data: data });
			});
		});
	})(businessProcessesBySteps);
};
