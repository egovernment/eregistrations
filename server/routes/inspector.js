'use strict';

var assign                  = require('es5-ext/object/assign')
  , ensureObject            = require('es5-ext/object/valid-object')
  , ensureDriver            = require('dbjs-persistence/ensure-driver')
  , getBaseRoutes           = require('./authenticated')
  , getData                 = require('../business-process-query/get-data')
  , filterBusinessProcesses = require('../business-process-query/business-processes/filter')
  , getViewRecords          = require('../business-process-query/get-view-records')
  , sortData                = require('../../utils/query/sort')
  , getPage                 = require('../../utils/query/get-page')
  , QueryHandler            = require('../../utils/query-handler')
  , listProperties          = require('../../apps/inspector/list-properties')
  , listComputedProperties  = require('../../apps/inspector/list-computed-properties')
  , queryHandlerConf        = require('../../apps/inspector/query-conf');

module.exports = exports = function (config) {
	var driver                 = ensureDriver(ensureObject(config).driver)
	  , processingStepsMeta    = ensureObject(config.processingStepsMeta)
	  , queryHandler           = new QueryHandler(queryHandlerConf);

	getData(driver, processingStepsMeta).done();

	return assign({
		'get-data': function (query) {
			return queryHandler.resolve(query)(function (query) {
				return getData(driver, processingStepsMeta);
			})(function (data) {
				var fullSize;

				data = sortData(
					filterBusinessProcesses(data.businessProcesses, query),
					function (bpA, bpB) {
						return bpA.createdDateTime.getTime() - bpB.createdDateTime.getTime();
					}
				);

				if (!data.length) {
					return { size: 0, view: [] };
				}

				fullSize = data.length;

				data = getPage(data, query.page);

				return getViewRecords(data, listProperties, listComputedProperties)(function (result) {
					result.size = fullSize;

					return result;
				});
			});
		}
	}, getBaseRoutes());
};
