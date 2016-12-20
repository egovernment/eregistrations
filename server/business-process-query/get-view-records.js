'use strict';

var deferred       = require('deferred')
  , flatten        = require('es5-ext/array/#/flatten')
  , aFrom          = require('es5-ext/array/from')
  , anyIdToStorage = require('../utils/any-id-to-storage');

module.exports = function (data, listProperties, listComputedProperties) {
	var directEvents, computedEvents;

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

	return deferred(directEvents, computedEvents)
		.spread(function (directEvents, computedEvents) {
			return {
				view: data.map(function (businessProcess) { return businessProcess.businessProcessId; }),
				data: flatten.call([directEvents, computedEvents]).filter(Boolean)
			};
		});
};
