'use strict';

var deferred       = require('deferred')
  , flatten        = require('es5-ext/array/#/flatten')
  , aFrom          = require('es5-ext/array/from')
  , anyIdToStorage = require('../utils/any-id-to-storage');

module.exports = function (data, listProperties, listComputedProperties) {
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
