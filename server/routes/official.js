'use strict';

var assign                    = require('es5-ext/object/assign')
  , ensureObject              = require('es5-ext/object/valid-object')
  , startsWith                = require('es5-ext/string/#/starts-with')
  , customError               = require('es5-ext/error/custom')
  , getBaseRoutes             = require('./authenticated')
  , getData                   = require('../business-process-query/get-data')
  , reduceSteps               = require('../business-process-query/steps/reduce-time')
  , filterSteps               = require('../business-process-query/steps/filter')
  , getViewRecords            = require('../business-process-query/get-view-records')
  , anyIdToStorage            = require('../utils/any-id-to-storage')
  , statusLogPrintPdfRenderer = require('../pdf-renderers/business-process-status-log-print')
  , sortData                  = require('../../utils/query/sort')
  , getPage                   = require('../../utils/query/get-page')
  , QueryHandler              = require('../../utils/query-handler')
  , listProperties            = require('../../apps/official/business-process-list-properties')
  , listComputedProperties    =
			require('../../apps/official/business-process-list-computed-properties')
  , queryHandlerConf          = require('../../apps/official/query-conf')
  , getStatsQueryHandlerConf  = require('../../apps/statistics/get-query-conf')
  , getReductionTemplate      =
		require('../business-process-query/utils/get-time-reduction-template')
  , memoize                   = require('memoizee')
  , Map                       = require('es6-map')
  , deferred                  = require('deferred');

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

var getStatsOverviewData = memoize(function (query, userId) {
	return getData(require('mano').dbDriver)(function (data) {
		data = reduceSteps(filterSteps(data, query));

		return {
			processor: (data.byStepAndProcessor[query.step][userId] || getReductionTemplate()).processing,
			stepTotal: data.byStep[query.step].processing
		};
	});
}, {
	normalizer: function (args) {
		return args[0].step + args[1]
			+ args[0].dateFrom + args[0].dateTo;
	},
	maxAge: 1000 * 60 * 60
});

module.exports = exports = function (config) {
	ensureObject(config);
	var driver                 = require('mano').dbDriver
	  , queryHandler           = new QueryHandler(queryHandlerConf)
	  , statsHandlerOpts, statsOverviewQueryHandler, decorateQuery;

	statsHandlerOpts = {
		processingStepsMeta: require('../../processing-steps-meta'),
		db: require('mano').db,
		driver: driver
	};

	statsOverviewQueryHandler = new QueryHandler(getStatsQueryHandlerConf(statsHandlerOpts));

	if (config.decorateQuery) {
		decorateQuery = config.decorateQuery;
	} else {
		decorateQuery = function (query, req) {
			if (config.step) {
				query.step = config.step;
			}
			return deferred(query);
		};
	}

	return assign({
		'get-data': function (query) {
			var req = this.req;

			return decorateQuery(query, req)(function () {
				return queryHandler.resolve(query);
			})(function (query) {
				return getData(driver);
			})(function (data) {
				var fullSize;
				data = filterSteps(data, query);
				var result = new Map();
				data.steps.forEach(function (step) {
					step.forEach(function (item, key) {
						if (data.businessProcesses.has(key)) {
							result.set(key, data.businessProcesses.get(key));
						}
					});
				});
				data = result;
				data = sortData(data, function (bpA, bpB) {
					return bpA.createdDateTime - bpB.createdDateTime;
				});

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
		'get-processing-time-data': function (query) {
			var req = this.req;
			if (!statsOverviewQueryHandler) return null;
			var userId = req.$user;

			return decorateQuery(query, req)(function () {
				return statsOverviewQueryHandler.resolve(query);
			})(function (query) {
				return getStatsOverviewData(query, userId);
			});
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
