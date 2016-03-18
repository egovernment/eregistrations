'use strict';

var ensureObject    = require('es5-ext/object/valid-object')
  , ensureString    = require('es5-ext/object/validate-stringifiable-value')
  , serializeValue  = require('dbjs/_setup/serialize/value')
  , ensureStorage   = require('dbjs-persistence/ensure-storage')
  , getDbSet        = require('eregistrations/server/utils/get-db-set')
  , getDbArray      = require('eregistrations/server/utils/get-db-array')
  , resolveFullPath = require('../../utils/resolve-processing-step-full-path')
  , trackFirstPage  = require('./first-page');

module.exports = function (stepPath, status, data) {
	var sortIndexName, value,  businessProcessStorage, reducedStorage, meta, officialId
	  , trackerOptions;
	stepPath = ensureString(stepPath);
	status = ensureString(status);
	data = ensureObject(data);
	meta = ensureObject(data.meta);
	businessProcessStorage = data.businessProcessStorage;
	reducedStorage = ensureStorage(data.reducedStorage);
	if (data.officialId != null) officialId = ensureString(data.officialId);
	if (data.itemsPerPage != null) trackerOptions = { itemsPerPage: data.itemsPerPage };

	sortIndexName = 'processingSteps/map/' + resolveFullPath(stepPath) + '/isReady';
	value = serializeValue(meta.indexValue);

	return getDbSet(businessProcessStorage, 'computed', meta.indexName, value)(
		officialId && function (set) {
			return getDbSet(businessProcessStorage, 'direct',
				'processingSteps/map/' + resolveFullPath(stepPath) + '/assignee',
				'7' + officialId)(
				function (assignedBusinessProcesses) { return set.and(assignedBusinessProcesses); }
			);
		}
	)(function (set) {
		return getDbArray(set, businessProcessStorage, 'computed', sortIndexName)(function (array) {
			var viewPath = officialId ? ('assigned/7' + officialId + '/' + stepPath) : stepPath;
			return trackFirstPage(reducedStorage,
				'pendingBusinessProcesses/' + viewPath + '/' + status, set, array, trackerOptions);
		});
	});
};
