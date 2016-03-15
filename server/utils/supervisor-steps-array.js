'use strict';

var supervisorMeta = require('../../utils/processing-steps-map')
  , deferred       = require('deferred')
  , getDbSet       = require('./get-db-set')
  , getDbArray     = require('./get-db-array')
  , serializeValue = require('dbjs/_setup/serialize/value');

module.exports = function (storage, onProcessingStepsChange) {
	var supervisorResults = {};
	return deferred.map(Object.keys(supervisorMeta),
		function (name) {
			var keyPath = supervisorMeta[name].indexName
			  , value = serializeValue(supervisorMeta[name].indexValue);
			return getDbSet(storage, 'computed', keyPath, value)(function (set) {
				return getDbArray(set, storage, 'computed', keyPath)(function (array) {
					var processingStepKeyPath = 'processingSteps/map/' + name;
					supervisorResults[processingStepKeyPath] = array;
					if (typeof onProcessingStepsChange === 'function') {
						supervisorResults[processingStepKeyPath].on('change', onProcessingStepsChange);
					}
					return supervisorResults[processingStepKeyPath];
				});
			});
		})(supervisorResults);
};
