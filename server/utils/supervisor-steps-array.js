'use strict';

var deferred        = require('deferred')
  , serializeValue  = require('dbjs/_setup/serialize/value')
  , getDbSet        = require('./get-db-set')
  , getDbArray      = require('./get-db-array')
  , resolveStepPath = require('../../utils/resolve-processing-step-full-path');

module.exports = function (storages, stepsMap, onProcessingStepsChange) {
	var supervisorResults = {};

	return deferred.map(Object.keys(stepsMap), function (stepName) {
		var processingStepKeyPath = 'processingSteps/map/' + resolveStepPath(stepName);

		var stepStorages = stepsMap[stepName]._services.map(function (name) { return storages[name]; });

		supervisorResults[processingStepKeyPath] = {};

		return deferred.map(Object.keys(stepsMap[stepName]), function (statusName) {
			var keyPath = stepsMap[stepName][statusName].indexName
			  , value   = stepsMap[stepName][statusName].indexValue;

			return getDbSet(stepStorages, 'computed', keyPath, serializeValue(value))(function (set) {
				return getDbArray(set, stepStorages, 'computed', keyPath)(function (array) {
					supervisorResults[processingStepKeyPath][statusName] = array;

					if (typeof onProcessingStepsChange === 'function') {
						array.on('change', onProcessingStepsChange);
					}

					return array;
				});
			});
		});
	})(supervisorResults);
};
