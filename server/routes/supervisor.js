// Official roles GET controllers

'use strict';

var aFrom               = require('es5-ext/array/from')
  , flatten             = require('es5-ext/array/#/flatten')
  , uniq                = require('es5-ext/array/#/uniq')
  , isNaturalNumber     = require('es5-ext/number/is-natural')
  , toNaturalNumber     = require('es5-ext/number/to-pos-integer')
  , toArray             = require('es5-ext/object/to-array')
  , includes            = require('es5-ext/string/#/contains')
  , deferred            = require('deferred')
  , memoize             = require('memoizee')
  , serializeValue      = require('dbjs/_setup/serialize/value')
  , unserializeValue    = require('dbjs/_setup/unserialize/value')
  , mano                = require('mano')
  , QueryHandler        = require('../../utils/query-handler')
  , defaultItemsPerPage = require('../../conf/objects-list-items-per-page')
  , getDbSet            = require('../utils/get-db-set')
  , getDbArray          = require('../utils/get-db-array')
  , stepsMap            = require('../../utils/processing-steps-map')
  , listItemsPerPage    = require('mano').env.objectsListItemsPerPage
  , timeRanges          = require('../../utils/supervisor-time-ranges')
  , someRight           = require('es5-ext/array/#/some-right')
  , forEach             = require('es5-ext/object/for-each')
  , allSupervisorSteps  = require('../utils/supervisor-steps-array')()
  , bpListProps         = require('../../utils/supervisor-list-properties')
  , bpListComputedProps = require('../../utils/supervisor-list-computed-properties')

  , hasBadWs       = RegExp.prototype.test.bind(/\s{2,}/)
  , compareStamps  = function (a, b) { return a.stamp - b.stamp; }
  , isArray        = Array.isArray, slice = Array.prototype.slice, push = Array.prototype.push
  , ceil           = Math.ceil
  , stringify      = JSON.stringify;

// Business processes table query handler
var getTableQueryHandler = function (stepsMap) {
	var queryHandler = new QueryHandler(exports.tableQueryConf);
	queryHandler._statusMap = stepsMap;
	return queryHandler;
};

// Single business process full data query handler
var getBusinessProcessQueryHandler = function () {
	return new QueryHandler([
		{
			name: 'id',
			ensure: function (value) {
				if (!value) throw new Error("Missing id");

				return mano.dbDriver.getComputed(value)(function (data) {
					if (!data || (data.value !== '11')) return null;
					return value;
				});
			}
		}
	]);
};

var getFilteredArray = function (arr, filterString) {
	var result = [];

	var filter = function (data, searchData) {
		if (!searchData) return;
		var value = unserializeValue(searchData.value);
		if (value && includes.call(value, filterString)) result.push(data);
	};
	var findAndFilter = function (data) {
		var dataId = data.id.slice(0, data.id.indexOf('/'));
		return mano.dbDriver.getComputed(dataId + '/searchString').done(function (searchData) {
			filter(data, searchData);
		});
	};
	return deferred.map(arr, findAndFilter).then(function () {
		return deferred(result);
	});
};

var initializeHandler = function () {
	var tableQueryHandler   = getTableQueryHandler(stepsMap)
	  , itemsPerPage        = toNaturalNumber(listItemsPerPage) || defaultItemsPerPage
	  , businessProcessQueryHandler = getBusinessProcessQueryHandler()
	  , indexes;

	if (bpListComputedProps) {
		indexes = [];
		deferred.map(bpListComputedProps, function (keyPath) {
			return mano.dbDriver.indexKeyPath(keyPath)(function (map) {
				indexes.push({ keyPath: keyPath, map: map });
			});
		});
	}

	var getTableData = memoize(function (query) {
		var promise, timeThreshold;
		someRight.call(timeRanges, function (item) {
			if (query.time === item.name) {
				timeThreshold = item.value;
				return true;
			}
		});
		if (query.step) {
			promise = getDbSet('computed', stepsMap[query.step].indexName,
				serializeValue(stepsMap[query.step].indexValue)).then(
				function (baseSet) {
					return getDbArray(baseSet, 'computed', stepsMap[query.step].indexName).then(
						function (arr) {
							var result = [];
							arr.forEach(function (bp) {
								var timeValue = Date.now() - (bp.stamp / 1000);
								if (!timeThreshold || (timeValue >= timeThreshold)) {
									result.push({ id: bp.id + '/processingSteps/map/' + query.step,
										stamp: bp.stamp });
								}
							});
							return result;
						}
					);
				}
			);
		} else {
			promise = allSupervisorSteps.then(function (supervisorResults) {
				var result = [];
				forEach(supervisorResults, function (subArray, keyPath) {
					subArray.forEach(function (bp) {
						var timeValue = Date.now() - (bp.stamp / 1000);
						if (!timeThreshold || (timeValue >= timeThreshold)) {
							result.push({ id: bp.id + '/' + keyPath, stamp: bp.stamp });
						}
					});
				});
				result.sort(compareStamps);
				return result;
			});
		}

		return promise(function (arr) {
			if (!query.search) return arr;
			return deferred.map(query.search.split(/\s+/).sort(), function (value) {
				return getFilteredArray(arr, value);
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
					var objId = data.id;
					return deferred.map(bpListComputedProps, function (keyPath) {
						return mano.dbDriver.getComputed(objId + '/' + keyPath)(function (data) {
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
				return mano.dbDriver.getObject(dataId, { keyPaths: bpListProps })(function (datas) {
					return datas.map(function (data) {
						return data.data.stamp + '.' + data.id + '.' + data.data.value;
					});
				});
			});

			return deferred(directEvents, computedEvents)
				.spread(function (directEvents, computedEvents) {
					return {
						view: arr.map(function (data) {
							return data.stamp + '.' + data.id;
						}).join('\n'),
						size: size,
						data: flatten.call([directEvents, computedEvents])
					};
				});
		});
	}, {
		normalizer: function (args) { return String(toArray(args[0], null, null, true)); },
		maxAge: 10 * 1000
	});

	return {
		tableQueryHandler: tableQueryHandler,
		getTableData: getTableData,
		businessProcessQueryHandler: businessProcessQueryHandler
	};
};

module.exports = exports = function () {
	var resolveHandler;
	resolveHandler = (function () {
		var handler = initializeHandler();

		return function (req) {
			return deferred(handler);
		};
	}());

	return {
		'get-processing-steps-view': function (query) {
			return resolveHandler(this.req)(function (handler) {
				return handler.tableQueryHandler.resolve(query)(function (query) {
					return handler.getTableData(query);
				});
			});
		},
		'get-business-process-data': function (query) {
			return resolveHandler(this.req)(function (handler) {
				// Get full data of one of the business processeses
				return handler.businessProcessQueryHandler.resolve(query)(function (query) {
					var recordId;
					if (!query.id) return { passed: false };
					recordId = this.req.$user + '/recentlyVisited/businessProcesses/' +
						handler.roleName + '*7' + query.id;
					return mano.dbDriver.store(recordId, '11')({ passed: true });
				}.bind(this));
			}.bind(this));
		}
	};
};

exports.tableQueryConf = [{
	name: 'step',
	ensure: function (value) {
		if (!value) return;
		if (!this._statusMap[value]) {
			throw new Error("Unreconized status value " + stringify(value));
		}
		return value;
	}
}, {
	name: 'time',
	ensure: function (value) {
		var result;
		if (!value) return;
		result = timeRanges.some(function (item) {
			if (item.name === value) {
				return true;
			}
		});
		if (!result) throw new Error("Unrecognized time value " + stringify(value));
		return value;
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
