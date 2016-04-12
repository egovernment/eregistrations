'use strict';

var ensureCallable  = require('es5-ext/object/valid-callable')
  , ensureObject    = require('es5-ext/object/valid-object')
  , ensureString    = require('es5-ext/object/validate-stringifiable-value')
  , serializeValue  = require('dbjs/_setup/serialize/value')
  , ensureStorage   = require('dbjs-persistence/ensure-storage')
  , getDbSet        = require('eregistrations/server/utils/get-db-set')
  , getDbArray      = require('eregistrations/server/utils/get-db-array')
  , resolveFullPath = require('../../utils/resolve-processing-step-full-path')
  , trackFirstPage  = require('./first-page');

module.exports = function (stepPath, status, data) {
	var sortIndexName, value,  businessProcessStorage, reducedStorage, meta, filter, trackerOptions
	  , viewPath;
	stepPath = ensureString(stepPath);
	status = ensureString(status);
	data = ensureObject(data);
	meta = ensureObject(data.meta);
	businessProcessStorage = data.businessProcessStorage;
	reducedStorage = ensureStorage(data.reducedStorage);
	if (data.filter != null) filter = ensureCallable(data.filter);
	if (data.itemsPerPage != null) trackerOptions = { itemsPerPage: data.itemsPerPage };
	viewPath = (data.viewPath != null) ? ensureString(data.viewPath) : stepPath;

	sortIndexName = 'processingSteps/map/' + resolveFullPath(stepPath) + '/isReady';
	value = serializeValue(meta.indexValue);

	return getDbSet(businessProcessStorage, 'computed', meta.indexName, value)(
		filter
	)(function (set) {
		return getDbArray(set, businessProcessStorage, 'computed', sortIndexName)(function (array) {
			return trackFirstPage(reducedStorage,
				'pendingBusinessProcesses/' + viewPath + '/' + status, set, array, trackerOptions);
		});
	});
};
