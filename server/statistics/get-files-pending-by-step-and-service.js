'use strict';

var capitalize                    = require('es5-ext/string/#/capitalize')
  , memoize                       = require('memoizee')
  , deferred                      = require('deferred')
  , unserializeValue              = require('dbjs/_setup/unserialize/value')
  , driver                        = require('mano').dbDriver
  , db                            = require('../../db')
  , resolveProcessingStepFullPath = require('../../utils/resolve-processing-step-full-path')
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
				// OUT: Corner case: File was ready, but was moved back due to model change
				if (value !== true) return;
				isReadyDate = toDateInTz(new Date(data.stamp / 1000), db.timeZone);
				// OUT: Started to be pending at step after date
				if (isReadyDate > date) return;
				// IN: Started to be pending at step at date
				if (isReadyDate.getTime() === date.getTime()) {
					addPendingFile(pendingFiles, stepShortPath);
					return;
				}
				// We need to check when it stopped been pending
				return storage.get(id.split('/', 1)[0] + '/' + stepFullPath + '/status')(function (status) {
					var statusDate, statusValue;
					if (status) {
						statusValue = unserializeValue(status.value);
						statusDate  = toDateInTz(new Date(status.stamp / 1000), db.timeZone);
					}
					if (!statusValue || date <= statusDate) {
						// IN: Either still pending, or stopped being pending after date
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
