'use strict';

var assign                    = require('es5-ext/object/assign')
  , ensureObject              = require('es5-ext/object/valid-object')
  , startsWith                = require('es5-ext/string/#/starts-with')
  , customError               = require('es5-ext/error/custom')
  , ensureDriver              = require('dbjs-persistence/ensure-driver')
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
//TODO console.log('CLEAN UP BELOW LISTS')
  , listProperties            = require('../../apps/inspector/list-properties')
  , listComputedProperties    = require('../../apps/inspector/list-computed-properties')
  , queryHandlerConf          = require('../../apps/inspector/query-conf')
  , getStatsQueryHandlerConf  = require('../../apps/statistics/get-query-conf')
  , getReductionTemplate      =
		require('../business-process-query/utils/get-time-reduction-template')
  , memoize                   = require('memoizee');

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

var getStatsOverviewData = memoize(function (query, userId, statsHandlerOpts) {
	var processingStepsMeta = statsHandlerOpts.processingStepsMeta;
	return getData(mano.dbDriver, processingStepsMeta)(function (data) {
		data = reduceSteps(filterSteps(data, query, processingStepsMeta), processingStepsMeta);
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

module.exports = exports = function (config/*, options */) {
	var driver                 = ensureDriver(ensureObject(config).driver)
	  , processingStepsMeta    = ensureObject(config.processingStepsMeta)
	  , queryHandler           = new QueryHandler(queryHandlerConf)
	  , options, statsHandlerOpts, statsOverviewQueryHandler;
	options = Object(arguments[1]);

	getData(driver, processingStepsMeta).done();

	statsHandlerOpts = {
		processingStepsMeta: ensureObject(processingStepsMeta),
		db: require('mano').db,
		driver: require('mano').dbDriver
	};

	statsOverviewQueryHandler = new QueryHandler(getStatsQueryHandlerConf(statsHandlerOpts));

	return assign({
		'get-data': function (query) {
			return queryHandler.resolve(query)(function (query) {
				return getData(driver, processingStepsMeta);
			})(function (data) {
				var fullSize;

				data = sortData(
					filterSteps(data.businessProcesses, query),
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
			if (!statsOverviewQueryHandler) return null;
			return resolveHandler(this.req)(function (handler) {
				var userId = this.req.$user;
				if (!handler.roleName) return;
				query.step = handler.roleName;

				return statsOverviewQueryHandler.resolve(query)(function (query) {
					return getStatsOverviewData(query, userId, statsHandlerOpts);
				});
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
