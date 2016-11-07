'use strict';

var assign                  = require('es5-ext/object/assign')
  , ensureObject            = require('es5-ext/object/valid-object')
  , flatten                 = require('es5-ext/array/#/flatten')
  , ensureDriver            = require('dbjs-persistence/ensure-driver')
  , deferred                = require('deferred')
  , aFrom                   = require('es5-ext/array/from')
  , getBaseRoutes           = require('./authenticated')
  , anyIdToStorage          = require('../utils/any-id-to-storage')
  , getData                 = require('../business-process-query/get-data')
  , filterBusinessProcesses = require('../business-process-query/business-processes/filter')
  , sortData                = require('../../utils/query/sort')
  , getPage                 = require('../../utils/query/get-page')
  , QueryHandler            = require('../../utils/query-handler')
  , listProperties          = require('../../apps/inspector/list-properties')
  , listComputedProperties  = require('../../apps/inspector/list-computed-properties');

var getRecords = function (data) {
	var viewEvents, directEvents, computedEvents;

	viewEvents = deferred.map(data, function (businessProcess) {
		var businessProcessId = businessProcess.businessProcessId;

		return anyIdToStorage(businessProcessId)(function (storage) {
			if (!storage) return;

			return storage.getObject(businessProcessId, { keyPaths: [] })(function (data) {
				data = data[0];
				return data.data.stamp + '.' + data.id;
			});
		});
	});

	computedEvents = deferred.map(data, function (businessProcess) {
		var businessProcessId = businessProcess.businessProcessId;

		return deferred.map(aFrom(listComputedProperties), function (keyPath) {
			return anyIdToStorage(businessProcessId)(function (storage) {
				if (!storage) return;

				return storage.getComputed(businessProcessId + '/' + keyPath)(function (data) {
					if (!data) return;
					if (Array.isArray(data.value)) {
						return data.value.map(function (data) {
							var key = data.key ? '*' + data.key : '';
							var result = data.stamp + '.' + businessProcessId + '/'
								+ keyPath + key + '.' + data.value;
							return result;
						});
					}
					var result = data.stamp + '.' + businessProcessId + '/' + keyPath + '.' + data.value;
					return result;
				});
			});
		});
	});

	directEvents = deferred.map(data, function (businessProcess) {
		var businessProcessId = businessProcess.businessProcessId;

		return anyIdToStorage(businessProcessId)(function (storage) {
			if (!storage) return;

			return storage.getObject(businessProcessId, {
				keyPaths: listProperties
			})(function (datas) {
				return datas.map(function (data) {
					return data.data.stamp + '.' + data.id + '.' + data.data.value;
				});
			});
		});
	});

	return deferred(viewEvents, directEvents, computedEvents)
		.spread(function (viewEvents, directEvents, computedEvents) {
			return {
				view: viewEvents.join('\n'),
				data: flatten.call([directEvents, computedEvents]).filter(Boolean)
			};
		});
};

module.exports = exports = function (config) {
	var driver                 = ensureDriver(ensureObject(config).driver)
	  , processingStepsMeta    = ensureObject(config.processingStepsMeta)
	  , queryHandler           = new QueryHandler(config.queryHandlerConf);

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

				fullSize = data.length;

				data = getPage(data, query.page);

				if (!data.length) {
					return { size: 0 };
				}

				return getRecords(data)(function (result) {
					result.size = fullSize;

					return result;
				});
			});
		}
	}, getBaseRoutes());
};
