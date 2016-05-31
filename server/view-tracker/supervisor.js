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
  , getDbSet            = require('../utils/get-db-set')
  , getDbArray          = require('../utils/get-db-array')

  , compareStamps = function (a, b) { return a.stamp - b.stamp; };

module.exports = function (steps, data) {
	var businessProcessStorage, reducedStorage, stepArrays, itemsPerPage;

	ensureObject(data);
	steps = filterStepsMap(steps);

	businessProcessStorage = ensureStorage(data.businessProcessStorage);
	reducedStorage = ensureStorage(data.reducedStorage);
	if (data.itemsPerPage != null) itemsPerPage = toNaturalNumber(data.itemsPerPage);
	if (!itemsPerPage) itemsPerPage = defaultItemsPerPage;

	// Configure view that covers 'all' roles case
	stepArrays = {};
	return deferred.map(Object.keys(steps), function (stepPath) {
		// TODO: Fix for deep paths
		var keyPath = 'processingSteps/map/' + stepPath + '/status';

		return deferred.map(Object.keys(steps[stepPath]), function (status) {
			var setPromise = getDbSet(businessProcessStorage, 'computed', keyPath,
				serializeValue(status));
			return setPromise(function (set) {
				return getDbArray(set, businessProcessStorage, 'computed', keyPath)(function (array) {
					stepArrays['processingSteps/map/' + stepPath] = array;
				});
			});
		});
	})(function () {
		var onChange = function () {
			var result = [];
			forEach(stepArrays, function (stepArray, keyPath) {
				stepArray.forEach(function (data) {
					result.push({ id: data.id + '/' + keyPath, stamp: data.stamp });
				});
			});
			result.sort(compareStamps);
			return reducedStorage.storeManyReduced([
				{ id: 'views/supervisor/all/totalSize', data: { value: serializeValue(result.length) } },
				{ id: 'views/supervisor/all/21',
					data: { value: serializeValue(serializeView(result.slice(0, itemsPerPage))) } }
			]);
		};

		forEach(stepArrays, function (stepArray) {
			stepArray.on('change', function () { onChange().done(); });
		});
		return onChange();
	})(Function.prototype);
};
