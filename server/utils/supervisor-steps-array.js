'use strict';

var deferred       = require('deferred')
  , getDbSet       = require('./get-db-set')
  , getDbArray     = require('./get-db-array')
  , serializeValue = require('dbjs/_setup/serialize/value');

module.exports = function (storage, stepsMap, onProcessingStepsChange) {
	var supervisorResults = {};

	return deferred.map(Object.keys(stepsMap), function (stepName) {
		var processingStepKeyPath = 'processingSteps/map/' + stepName;

		supervisorResults[processingStepKeyPath] = {};

		return deferred.map(Object.keys(stepsMap[stepName]), function (statusName) {
			var keyPath = stepsMap[stepName][statusName].indexName
			  , value   = stepsMap[stepName][statusName].indexValue;

			return getDbSet(storage, 'computed', keyPath, serializeValue(value))(function (set) {
				return getDbArray(set, storage, 'computed', keyPath)(function (array) {
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
