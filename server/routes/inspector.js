'use strict';

var assign                    = require('es5-ext/object/assign')
  , ensureObject              = require('es5-ext/object/valid-object')
  , startsWith                = require('es5-ext/string/#/starts-with')
  , customError               = require('es5-ext/error/custom')
  , ensureDriver              = require('dbjs-persistence/ensure-driver')
  , getBaseRoutes             = require('./authenticated')
  , getData                   = require('../business-process-query/get-data')
  , filterBusinessProcesses   = require('../business-process-query/business-processes/filter')
  , getViewRecords            = require('../business-process-query/get-view-records')
  , anyIdToStorage            = require('../utils/any-id-to-storage')
  , statusLogPrintPdfRenderer = require('../pdf-renderers/business-process-status-log-print')
  , sortData                  = require('../../utils/query/sort')
  , getPage                   = require('../../utils/query/get-page')
  , QueryHandler              = require('../../utils/query-handler')
  , listProperties            = require('../../apps/inspector/list-properties')
  , listComputedProperties    = require('../../apps/inspector/list-computed-properties')
  , queryHandlerConf          = require('../../apps/inspector/query-conf');

var businessProcessQueryHandler = new QueryHandler([{
	name: 'id',
	ensure: function (value) {
		if (!value) throw new Error("Missing id");
		return anyIdToStorage(value)(function (storage) {
			if (!storage) return null;
			if (!startsWith.call(storage.name, 'businessProcess')) return null;
			return value;
		});
	}
}]);

module.exports = exports = function (config) {
	var driver                 = ensureDriver(ensureObject(config).driver)
	  , queryHandler           = new QueryHandler(queryHandlerConf);

	getData(driver).done();

	return assign({
		'get-data': function (unresolvedQuery) {
			return queryHandler.resolve(unresolvedQuery)(function (query) {
				return getData(driver)(function (data) {
					var fullSize;

					data = sortData(
						filterBusinessProcesses(data.businessProcesses, query),
						function (bpA, bpB) {
							return bpA.createdDateTime - bpB.createdDateTime;
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
			});
		},
		'get-business-process-data': function (query) {
			// Get full data of one of the business processeses
			return businessProcessQueryHandler.resolve(query)(function (query) {
				var recordId;
				if (!query.id) return { passed: false };
				recordId = this.req.$user + '/recentlyVisited/businessProcesses/inspector*7' + query.id;
				return driver.getStorage('user').store(recordId, '11')({ passed: true });
			}.bind(this));
		},
		'business-process-status-log-print': {
			headers: {
				'Cache-Control': 'no-cache',
				'Content-Type': 'application/pdf; charset=utf-8'
			},
			controller: function (query) {
				var appName = this.req.$appName;
				// Get full data of one of the business processeses
				return businessProcessQueryHandler.resolve(query)(function (query) {
					if (!query.id) throw customError("Not Found", { statusCode: 404 });
					return statusLogPrintPdfRenderer(query.id, { streamable: true,
						appName: appName });
				});
			}
		}
	}, getBaseRoutes());
};
