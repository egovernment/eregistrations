// Official roles GET controllers

'use strict';

var aFrom               = require('es5-ext/array/from')
  , flatten             = require('es5-ext/array/#/flatten')
  , uniq                = require('es5-ext/array/#/uniq')
  , isNaturalNumber     = require('es5-ext/number/is-natural')
  , toNaturalNumber     = require('es5-ext/number/to-pos-integer')
  , assign              = require('es5-ext/object/assign')
  , forEach             = require('es5-ext/object/for-each')
  , toArray             = require('es5-ext/object/to-array')
  , ensureObject        = require('es5-ext/object/valid-object')
  , includes            = require('es5-ext/string/#/contains')
  , deferred            = require('deferred')
  , memoize             = require('memoizee')
  , serializeValue      = require('dbjs/_setup/serialize/value')
  , unserializeValue    = require('dbjs/_setup/unserialize/value')
  , ensureStorage       = require('dbjs-persistence/ensure-storage')
  , listItemsPerPage    = require('mano').env.objectsListItemsPerPage
  , QueryHandler        = require('../../utils/query-handler')
  , defaultItemsPerPage = require('../../conf/objects-list-items-per-page')
  , stepsMap            = require('../../utils/processing-steps-map')
  , timeRanges          = require('../../utils/supervisor-time-ranges')
  , bpListProps         = require('../../utils/supervisor-list-properties')
  , bpListComputedProps = aFrom(require('../../utils/supervisor-list-computed-properties'))
  , serializeView       = require('../../utils/db-view/serialize')
  , getDbSet            = require('../utils/get-db-set')
  , getDbArray          = require('../utils/get-db-array')
  , getSupervisorSteps  = require('../utils/supervisor-steps-array')
  , getBaseRoutes       = require('./authenticated')

  , hasBadWs       = RegExp.prototype.test.bind(/\s{2,}/)
  , compareStamps  = function (a, b) { return a.stamp - b.stamp; }
  , isArray        = Array.isArray, slice = Array.prototype.slice, push = Array.prototype.push
  , ceil           = Math.ceil
  , stringify      = JSON.stringify;

var getFilteredArray = function (storage, arr, filterString) {
	var result = [];

	var filter = function (data, searchData) {
		if (!searchData) return;
		var value = unserializeValue(searchData.value);
		if (value && includes.call(value, filterString)) result.push(data);
	};
	var findAndFilter = function (data) {
		var dataId = data.id.slice(0, data.id.indexOf('/'));
		return storage.getComputed(dataId + '/searchString')(function (searchData) {
			filter(data, searchData);
		});
	};
	return deferred.map(arr, findAndFilter).then(function () {
		return deferred(result);
	});
};

var filterByTime = function (threshold, arr) {
	return arr.filter(function (processingStep) {
		var timeValue = Date.now() - (processingStep.stamp / 1000);
		return timeValue >= threshold;
	});
};

var getStepsFromBps = function (businessProcessesArr, keyPath) {
	return businessProcessesArr.map(function (bp) {
		return { id: bp.id + '/' + keyPath, stamp: bp.stamp };
	});
};

var initializeHandler = function (conf) {
	var tableQueryHandler = new QueryHandler(exports.tableQueryConf)
	  , itemsPerPage = toNaturalNumber(listItemsPerPage) || defaultItemsPerPage
	  , storage = ensureStorage(conf.storage)
	  , allSupervisorSteps = getSupervisorSteps(storage);

	var getTableData = memoize(function (query) {
		var promise;

		if (query.step) {
			promise = getDbSet(storage, 'computed', stepsMap[query.step].indexName,
				serializeValue(stepsMap[query.step].indexValue)).then(
				function (baseSet) {
					return getDbArray(baseSet, storage, 'computed', stepsMap[query.step].indexName).then(
						function (arr) {
							return getStepsFromBps(arr, 'processingSteps/map/' + query.step);
						}
					);
				}
			);
		} else {
			promise = allSupervisorSteps.then(function (supervisorResults) {
				var result = [];
				forEach(supervisorResults, function (subArray, keyPath) {
					result = result.concat(getStepsFromBps(subArray, keyPath));
				});
				result.sort(compareStamps);
				return result;
			});
		}

		return promise(function (arr) {
			if (query.time) {
				arr = filterByTime(query.time, arr);
			}
			if (!query.search) return arr;
			return deferred.map(query.search.split(/\s+/).sort(), function (value) {
				return getFilteredArray(storage, arr, value);
			})(function (arrays) {
				if (arrays.length === 1) return arrays[0];

				return uniq.call(arrays.reduce(function (current, next, index) {
					if (index === 1) current = aFrom(current);
					push.apply(current, next);
					return current;
				})).sort(compareStamps);
			});
		})(function (arr) {
			var size = arr.length, pageCount, offset, computedEvents, directEvents;
			if (!size) return { size: size };
			pageCount = ceil(size / itemsPerPage);
			if (query.page > pageCount) return { size: size };

			// Pagination
			offset = (query.page - 1) * itemsPerPage;
			arr = slice.call(arr, offset, offset + itemsPerPage);
			if (bpListComputedProps) {
				computedEvents = deferred.map(arr, function (data) {
					var listProps, objId, step;
					objId = data.id.slice(0, data.id.indexOf('/'));
					step  = data.id.split('/').slice(-1);

					listProps = bpListComputedProps.filter(function (prop) {
						return prop.indexOf(step) !== -1;
					});
					return deferred.map(listProps, function (keyPath) {
						return storage.getComputed(objId + '/' + keyPath)(function (data) {
							if (isArray(data.value)) {
								return data.value.map(function (data) {
									var key = data.key ? '*' + data.key : '';
									return data.stamp + '.' + objId + '/' + keyPath + key + '.' + data.value;
								});
							}
							return data.stamp + '.' + objId + '/' + keyPath + '.' + data.value;
						});
					});
				});
			} else {
				computedEvents = [];
			}
			directEvents = deferred.map(arr, function (data) {
				var dataId = data.id.slice(0, data.id.indexOf('/'));
				return storage.getObject(dataId, { keyPaths: bpListProps })(function (datas) {
					return datas.map(function (data) {
						return data.data.stamp + '.' + data.id + '.' + data.data.value;
					});
				});
			});

			return deferred(directEvents, computedEvents)
				.spread(function (directEvents, computedEvents) {
					return {
						view: serializeView(arr),
						size: size,
						data: flatten.call([directEvents, computedEvents])
					};
				});
		});
	}, {
		normalizer: function (args) { return String(toArray(args[0], null, null, true)); },
		maxAge: 10 * 1000
	});

	var businessProcessQueryHandler = new QueryHandler([
		{
			name: 'id',
			ensure: function (value) {
				if (!value) throw new Error("Missing id");
				return storage.get(value + '/isSubmitted')(function (data) {
					if (!data || (data.value !== '11')) return null;
					return value;
				});
			}
		}
	]);

	return {
		tableQueryHandler: tableQueryHandler,
		getTableData: getTableData,
		businessProcessQueryHandler: businessProcessQueryHandler
	};
};

module.exports = exports = function (conf) {
	var handler = initializeHandler(ensureObject(conf));

	return assign({
		'get-processing-steps-view': function (query) {
			return handler.tableQueryHandler.resolve(query)(function (query) {
				return handler.getTableData(query);
			});
		},
		'get-business-process-data': function (query) {
			// Get full data of one of the business processeses
			return handler.businessProcessQueryHandler.resolve(query)(function (query) {
				var recordId;
				if (!query.id) return { passed: false };
				recordId = this.req.$user + '/recentlyVisited/businessProcesses/supervisor*7' + query.id;
				return conf.storage.driver.getStorage('user').store(recordId, '11')({ passed: true });
			}.bind(this));
		}
	}, getBaseRoutes());
};

exports.tableQueryConf = [{
	name: 'step',
	ensure: function (value) {
		if (!value) return;
		if (!stepsMap[value]) {
			throw new Error("Unreconized status value " + stringify(value));
		}
		return value;
	}
}, {
	name: 'time',
	ensure: function (value) {
		var result;
		if (!value) return;
		timeRanges.some(function (item) {
			if (item.name === value) {
				result = item.value;
				return true;
			}
		});
		if (!result) throw new Error("Unrecognized time value " + stringify(value));
		return result;
	}
}, {
	name: 'search',
	ensure: function (value) {
		if (!value) return;
		if (value.toLowerCase() !== value) throw new Error("Unexpected search value");
		if (hasBadWs(value)) throw new Error("Unexpected search value");
		if (value !== uniq.call(value.split(/\s/)).join(' ')) {
			throw new Error("Unexpected search value");
		}
		return value;
	}
}, {
	name: 'page',
	ensure: function (value) {
		var num;
		if (isNaN(value)) throw new Error("Unrecognized page value " + stringify(value));
		num = Number(value);
		if (!isNaturalNumber(num)) throw new Error("Unreconized page value " + stringify(value));
		if (!num) throw new Error("Unexpected page value " + stringify(value));
		return value;
	}
}];
