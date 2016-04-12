'use strict';

var ensureObject = require('es5-ext/object/valid-object')
  , ensureString = require('es5-ext/object/validate-stringifiable-value')
  , deferred     = require('deferred')
  , trackStatus  = require('./processing-step-status')

  , keys = Object.keys;

module.exports = function (stepPath, meta, data) {
	stepPath = ensureString(stepPath);
	meta = ensureObject(meta);
	data = ensureObject(data);

	return deferred.map(keys(meta), function (status) {
		return trackStatus(stepPath, status, {
			meta: meta[status],
			businessProcessStorage: data.businessProcessStorage,
			reducedStorage: data.reducedStorage,
			filter: data.filter,
			viewPath: data.viewPath,
			itemsPerPage: data.itemsPerPage
		});
	});
};
