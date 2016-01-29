'use strict';

var supervisorMeta = require('../../utils/processing-steps-map')
  , deferred       = require('deferred')
  , getDbSet       = require('./get-db-set')
  , getDbArray     = require('./get-db-array')
  , serializeValue = require('dbjs/_setup/serialize/value');

var supervisorResults = {};

module.exports = function (onProcessingStepsChange) {
	return deferred.map(Object.keys(supervisorMeta),
		function (name) {
			var keyPath = supervisorMeta[name].indexName;
			return getDbSet('computed', keyPath,
				serializeValue(supervisorMeta[name].indexValue))(function (set) {
				return getDbArray(set, 'computed', keyPath)(function (array) {
					var processingStepKeyPath = 'processingSteps/map/' + name;
					supervisorResults[processingStepKeyPath] = array;
					if (typeof onProcessingStepsChange === 'function') {
						supervisorResults[processingStepKeyPath].on('change', onProcessingStepsChange);
					}
					return supervisorResults[processingStepKeyPath];
				});
			});
		}).then(function () {
		return supervisorResults;
	});
};
