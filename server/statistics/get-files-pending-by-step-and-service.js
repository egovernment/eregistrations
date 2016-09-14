'use strict';

var resolveProcessingStepFullPath = require('../../utils/resolve-processing-step-full-path')
  , capitalize                    = require('es5-ext/string/#/capitalize')
  , unserializeValue              = require('dbjs/_setup/unserialize/value')
  , deferred                      = require('deferred')
  , db                            = require('../../db')
  , driver                        = require('mano').dbDriver
  , memoize                       = require('memoizee')
  , toDateInTz                    = require('../../utils/to-date-in-time-zone');

var addPendingFile = function (pendingFiles, stepShortPath) {
	if (!pendingFiles[stepShortPath]) pendingFiles[stepShortPath] = 0;
	pendingFiles[stepShortPath]++;
};

module.exports = memoize(function (date, processingStepsMeta) {
	var pendingFiles = {};
	return deferred.map(Object.keys(processingStepsMeta), function (stepShortPath) {
		var stepPath, stepFullPath, services;
		services = processingStepsMeta[stepShortPath]._services;
		stepPath = resolveProcessingStepFullPath(stepShortPath);
		stepFullPath = 'processingSteps/map/' + stepPath;

		return deferred.map(services, function (serviceName) {
			var storage = driver.getStorage('businessProcess' + capitalize.call(serviceName));
			return storage.searchComputed({ keyPath: stepFullPath + '/isReady' }, function (id, data) {
				var value, isReadyDate;
				value = unserializeValue(data.value);
				// wither never got to this step, or were moved back due to model change
				if (value !== true) return;
				isReadyDate = toDateInTz(new Date(data.stamp / 1000), db.timeZone);
				// bullseye, the process started to be pending at exactly the same day as date
				if (isReadyDate.getTime() === date.getTime()) {
					addPendingFile(pendingFiles, stepShortPath);
					return;
				}
				// isReady changes only once and to true, so if it changed after our date,
				// than the process was not pending at this step at date
				if (isReadyDate > date) return;
				// Worst case, we need to check the status
				return storage.get(id.split('/', 1)[0] + '/' + stepFullPath + '/status')(function (status) {
					var statusDate, statusValue;
					if (status) {
						statusValue = unserializeValue(status.value);
						statusDate  = toDateInTz(new Date(status.stamp / 1000), db.timeZone);
					}
					if (!statusValue || date <= statusDate) {
						addPendingFile(pendingFiles, stepShortPath);
					}
				});
			});
		});
	})(pendingFiles);
}, {
	normalizer: function (args) { return JSON.stringify(args[0]); },
	// One day
	maxAge: 86400000
});
