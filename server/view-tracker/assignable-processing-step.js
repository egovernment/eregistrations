'use strict';

var resolveFullPath = require('../../utils/resolve-processing-step-full-path')
  , getDbSet        = require('../utils/get-db-set')
  , trackStep       = require('./processing-step');

module.exports = function (officialId, stepPath, meta, data) {
	return trackStep(stepPath, meta, {
		businessProcessStorage: data.businessProcessStorage,
		reducedStorage: data.reducedStorage,
		filter: function (set) {
			return getDbSet(data.businessProcessStorage, 'direct',
				'processingSteps/map/' + resolveFullPath(stepPath) + '/assignee', '7' + officialId)(
				function (assignedBusinessProcesses) { return set.and(assignedBusinessProcesses); }
			);
		},
		viewPath: 'assigned/7' + officialId + '/' + stepPath,
		itemsPerPage: data.itemsPerPage
	});
};
