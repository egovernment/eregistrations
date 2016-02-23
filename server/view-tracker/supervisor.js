'use strict';

var toNaturalNumber     = require('es5-ext/number/to-pos-integer')
  , findKey             = require('es5-ext/object/find-key')
  , forEach             = require('es5-ext/object/for-each')
  , ensureObject        = require('es5-ext/object/valid-object')
  , deferred            = require('deferred')
  , serializeValue      = require('dbjs/_setup/serialize/value')
  , ensureStorage       = require('dbjs-persistence/ensure-storage')
  , defaultItemsPerPage = require('../../conf/objects-list-items-per-page')
  , serializeView       = require('../utils/db-view/serialize')
  , getDbSet            = require('../utils/get-db-set')
  , getDbArray          = require('../utils/get-db-array')
  , trackStepStatus     = require('./processing-step-status')

  , compareStamps = function (a, b) { return a.stamp - b.stamp; }

  , keys = Object.keys;

module.exports = function (data) {
	var businessProcessStorage, reducedStorage, stepArrays, itemsPerPage
	  , assignableStepsPromise;
	ensureObject(data);
	ensureObject(data.steps);
	businessProcessStorage = ensureStorage(data.businessProcessStorage);
	reducedStorage = ensureStorage(data.reducedStorage);
	if (data.itemsPerPage != null) itemsPerPage = toNaturalNumber(data.itemsPerPage);
	if (!itemsPerPage) itemsPerPage = defaultItemsPerPage;

	if (data.assignableStepsMeta != null) {
		// Assignable steps do not have default views configured, however we need default (pending)
		// status view configured for supervisor, therefore we do it here
		assignableStepsPromise = deferred.map(keys(data.assignableStepsMeta), function (stepPath) {
			var meta = this[stepPath]
			  , defaultStatus = findKey(meta, function (meta) { return meta.default; });
			return trackStepStatus(stepPath, defaultStatus, {
				meta: meta[defaultStatus],
				businessProcessStorage: data.businessProcessStorage,
				reducedStorage: data.reducedStorage,
				itemsPerPage: data.itemsPerPage
			});
		}, data.assignableStepsMeta);
	}

	// Configure view that covers 'all' roles case
	stepArrays = {};
	return deferred(
		assignableStepsPromise,
		deferred.map(keys(data.steps), function (stepPath) {
			// TODO: Fix for deep paths
			var keyPath = 'processingSteps/map/' + stepPath + '/resolvedStatus';
			var setPromise = getDbSet(businessProcessStorage, 'computed', keyPath,
				serializeValue('pending'));
			return setPromise(function (set) {
				return getDbArray(set, 'computed', keyPath)(function (array) {
					stepArrays['processingSteps/map/' + stepPath] = array;
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
				return reducedStorage.storeMany([
					{ id: 'views/supervisor/all/totalSize', data: { value: serializeValue(result.length) } },
					{ id: 'views/supervisor/all/21',
						data: { value: serializeValue(serializeView(result.slice(0, itemsPerPage))) } }
				]);
			};

			forEach(stepArrays, function (stepArray) {
				stepArray.on('change', function () { onChange().done(); });
			});
			return onChange();
		})
	)(Function.prototype);
};
