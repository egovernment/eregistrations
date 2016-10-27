'use strict';

var assign                  = require('es5-ext/object/assign')
  , ensureObject            = require('es5-ext/object/valid-object')
  , ensureDriver            = require('dbjs-persistence/ensure-driver')
  , Set                     = require('es6-set')
  , deferred                = require('deferred')
  , getBaseRoutes           = require('./authenticated')
  , anyIdToStorage          = require('../utils/any-id-to-storage')
  , getData                 = require('../business-process-query/get-data')
  , reduceBusinessProcesses = require('../business-process-query/business-processes/reduce-time')
  , unserializeValue        = require('dbjs/_setup/unserialize/value')
  , filterBusinessProcesses = require('../business-process-query/business-processes/filter')
  , queryHandlerConf        = require('../../apps/inspector/query-conf')
  , QueryHandler            = require('../../utils/query-handler');

var listProperties = new Set(['submitterType', 'companyName']);
var listComputedProperties = ['status', 'businessName'];

var getRecords = function (data, keyPaths) {
	ensureObject(keyPaths);

	return deferred.map(Array.from(data.keys()), function (objectId) {
		var object = {};

		return anyIdToStorage(objectId)(function (storage) {
			var directEvents, computedEvents;

			if (!storage) return;

			if (keyPaths.direct) {
				directEvents = deferred.map(keyPaths.direct, function (keyPath) {
					return storage.get(objectId + '/' + keyPath)(function (data) {
						object[keyPath] = unserializeValue(data.value);
					});
				});
			} else {
				directEvents = deferred(true);
			}

			if (keyPaths.computed) {
				computedEvents = deferred.map(keyPaths.computed, function (keyPath) {
					return storage.getComputed(objectId + '/' + keyPath)(function (data) {
						object[keyPath] = unserializeValue(data.value);
					});
				});
			} else {
				computedEvents = deferred(true);
			}

			return deferred(directEvents, computedEvents);
		})(object);
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
				return getData(driver, processingStepsMeta)(function (data) {
					return filterBusinessProcesses(data.businessProcesses, query);
				})(function (result) {
					return getRecords(result, { direct: listProperties, computed: listComputedProperties });
				});
			});
		}
	}, getBaseRoutes());
};
