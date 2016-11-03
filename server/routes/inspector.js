'use strict';

var assign                  = require('es5-ext/object/assign')
  , ensureObject            = require('es5-ext/object/valid-object')
  , flatten                 = require('es5-ext/array/#/flatten')
  , ensureDriver            = require('dbjs-persistence/ensure-driver')
  , Set                     = require('es6-set')
  , deferred                = require('deferred')
  , getBaseRoutes           = require('./authenticated')
  , anyIdToStorage          = require('../utils/any-id-to-storage')
  , getData                 = require('../business-process-query/get-data')
  , filterBusinessProcesses = require('../business-process-query/business-processes/filter')
  , sortData                = require('../../utils/query/sort')
  , getPage                 = require('../../utils/query/get-page')
  , queryHandlerConf        = require('../../apps/inspector/query-conf')
  , QueryHandler            = require('../../utils/query-handler');

var listProperties = new Set(['submitterType', 'companyName', 'isSubmitted']);
var listComputedProperties = ['status', 'businessName'];

var getRecords = function (data, keyPaths) {
	var viewEvents, directEvents, computedEvents;

	ensureObject(keyPaths);

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

	if (keyPaths.computed) {
		computedEvents = deferred.map(data, function (businessProcess) {
			var businessProcessId = businessProcess.businessProcessId;

			return deferred.map(keyPaths.computed, function (keyPath) {
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
	} else {
		computedEvents = [];
	}

	if (keyPaths.direct) {
		directEvents = deferred.map(data, function (businessProcess) {
			var businessProcessId = businessProcess.businessProcessId;

			return anyIdToStorage(businessProcessId)(function (storage) {
				if (!storage) return;

				return storage.getObject(businessProcessId, {
					keyPaths: keyPaths.direct
				})(function (datas) {
					return datas.map(function (data) {
						return data.data.stamp + '.' + data.id + '.' + data.data.value;
					});
				});
			});
		});
	} else {
		directEvents = [];
	}

	return deferred(viewEvents, directEvents, computedEvents)
		.spread(function (viewEvents, directEvents, computedEvents) {
			return {
				view: viewEvents.join('\n'),
				data: flatten.call([directEvents, computedEvents]).filter(Boolean)
			};
		});
};

module.exports = exports = function (config) {
	var driver              = ensureDriver(ensureObject(config).driver)
	  , processingStepsMeta = ensureObject(config.processingStepsMeta)
	  , queryHandler        = new QueryHandler(queryHandlerConf);

	getData(driver, processingStepsMeta).done();

	return assign({
		'get-data': function (query) {
			return queryHandler.resolve(query)(function (query) {
				return getData(driver, processingStepsMeta);
			})(function (data) {
				return filterBusinessProcesses(data.businessProcesses, query);
			})(function (data) {
				return sortData(data, function (bpA, bpB) {
					return bpA._createStamp - bpB._createStamp;
				});
			})(function (data) {
				var fullSize = data.length;

				data = getPage(data, query.page);

				if (!data.length) {
					return { size: 0 };
				}

				return getRecords(data, {
					direct: listProperties,
					computed: listComputedProperties
				})(function (result) {
					result.size = fullSize;

					return result;
				});
			});
		}
	}, getBaseRoutes());
};
