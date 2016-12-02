'use strict';

var toNaturalNumber     = require('es5-ext/number/to-pos-integer')
  , forEach             = require('es5-ext/object/for-each')
  , ensureObject        = require('es5-ext/object/valid-object')
  , deferred            = require('deferred')
  , serializeValue      = require('dbjs/_setup/serialize/value')
  , ensureStorage       = require('dbjs-persistence/ensure-storage')
  , defaultItemsPerPage = require('../../conf/objects-list-items-per-page')
  , serializeView       = require('../../utils/db-view/serialize')
  , filterStepsMap      = require('../../utils/filter-supervisor-steps-map')
  , resolveStepPath     = require('../../utils/resolve-processing-step-full-path')
  , getDbSet            = require('../utils/get-db-set')
  , getDbArray          = require('../utils/get-db-array')

  , compareStamps = function (a, b) { return a.stamp - b.stamp; };

module.exports = function (steps, data) {
	var businessProcessStorages, reducedStorage, stepArrays, itemsPerPage;

	ensureObject(data);
	steps = filterStepsMap(steps);

	businessProcessStorages = ensureObject(data.businessProcessStorages);
	reducedStorage = ensureStorage(data.reducedStorage);
	if (data.itemsPerPage != null) itemsPerPage = toNaturalNumber(data.itemsPerPage);
	if (!itemsPerPage) itemsPerPage = defaultItemsPerPage;

	// Configure view that covers 'all' roles case
	stepArrays = {};
	return deferred.map(Object.keys(steps), function (stepPath) {
		var fullStepPath = 'processingSteps/map/' + resolveStepPath(stepPath)
		  , keyPath = fullStepPath + '/status';
		var storages = steps[stepPath]._services.map(function (name) {
			return businessProcessStorages[name];
		});

		stepArrays[fullStepPath] = {};
		return deferred.map(Object.keys(steps[stepPath]), function (status) {
			var setPromise = getDbSet(storages, 'computed', keyPath, serializeValue(status));
			return setPromise(function (set) {
				return getDbArray(set, storages, 'computed', keyPath)(function (array) {
					stepArrays[fullStepPath][status] = array;
				});
			});
		});
	})(function () {
		var onChange = function () {
			var result = [];
			forEach(stepArrays, function (stepArrayStatuses, keyPath) {
				forEach(stepArrayStatuses, function (stepArray) {
					stepArray.forEach(function (data) {
						result.push({ id: data.id + '/' + keyPath, stamp: data.stamp });
					});
				});
			});
			result.sort(compareStamps);
			return reducedStorage.storeManyReduced([
				{ id: 'views/supervisor/all/totalSize', data: { value: serializeValue(result.length) } },
				{ id: 'views/supervisor/all/21',
					data: { value: serializeValue(serializeView(result.slice(0, itemsPerPage))) } }
			]);
		};

		forEach(stepArrays, function (stepArrayStatuses) {
			forEach(stepArrayStatuses, function (stepArray) {
				stepArray.on('change', function () { onChange().done(); });
			});
		});
		return onChange();
	})(Function.prototype);
};
