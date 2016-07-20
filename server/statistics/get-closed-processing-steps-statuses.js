'use strict';

var resolveProcessingStepFullPath = require('../../utils/resolve-processing-step-full-path')
  , capitalize                    = require('es5-ext/string/#/capitalize')
  , uncapitalize                  = require('es5-ext/string/#/uncapitalize')
  , unserializeValue              = require('dbjs/_setup/unserialize/value')
  , deferred                      = require('deferred')
  , memoize                       = require('memoizee');

module.exports = memoize(function (driver, processingStepsMeta) {
	var businessProcessesBySteps = {};
	return deferred.map(Object.keys(processingStepsMeta), function (stepMetaKey) {
		var stepPath, stepName, storages, services;
		services = processingStepsMeta[stepMetaKey]._services;
		stepName = resolveProcessingStepFullPath(stepMetaKey);
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
				businessProcessesBySteps[stepName].push({ id: id.split('/')[0], data: data,
					serviceName: uncapitalize.call(storage.name.slice('businessProcess'.length)),
					storage: storage
					});
			});
		});
	})(businessProcessesBySteps);
}, {
	length: 0,
	// One day
	maxAge: 86400000
});
