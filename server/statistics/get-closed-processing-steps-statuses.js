'use strict';

var capitalize                    = require('es5-ext/string/#/capitalize')
  , deferred                      = require('deferred')
  , memoize                       = require('memoizee')
  , unserializeValue              = require('dbjs/_setup/unserialize/value')
  , resolveProcessingStepFullPath = require('../../utils/resolve-processing-step-full-path');

module.exports = memoize(function (driver, processingStepsMeta, db) {
	var businessProcessesBySteps = {}, toDateInTz;
	toDateInTz = require('../../utils/to-date-in-time-zone')(db);
	return deferred.map(Object.keys(processingStepsMeta), function (stepShortPath) {
		var stepPath, stepFullPath, services;
		services = processingStepsMeta[stepShortPath]._services;
		stepPath = resolveProcessingStepFullPath(stepShortPath);
		stepFullPath = 'processingSteps/map/' + stepPath;

		return deferred.map(services, function (serviceName) {
			var storage = driver.getStorage('businessProcess' + capitalize.call(serviceName));
			return storage.search({ keyPath: stepFullPath + '/status' }, function (id, data) {
				var value;
				value = unserializeValue(data.value);
				if (value !== 'approved' && value !== 'rejected') return;
				if (!businessProcessesBySteps[stepShortPath]) {
					businessProcessesBySteps[stepShortPath] = [];
				}
				businessProcessesBySteps[stepShortPath].push({
					id: id.split('/')[0],
					data: data,
					date: toDateInTz(new Date(data.stamp / 1000), db.timeZone),
					stepFullPath: stepFullPath,
					serviceName: serviceName,
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
