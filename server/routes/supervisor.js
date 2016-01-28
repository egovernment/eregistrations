// Official roles GET controllers

'use strict';

var aFrom               = require('es5-ext/array/from')
  , flatten             = require('es5-ext/array/#/flatten')
  , remove              = require('es5-ext/array/#/remove')
  , uniq                = require('es5-ext/array/#/uniq')
  , isNaturalNumber     = require('es5-ext/number/is-natural')
  , toNaturalNumber     = require('es5-ext/number/to-pos-integer')
  , normalizeOptions    = require('es5-ext/object/normalize-options')
  , toArray             = require('es5-ext/object/to-array')
  , ensureObject        = require('es5-ext/object/valid-object')
  , ensureString        = require('es5-ext/object/validate-stringifiable-value')
  , includes            = require('es5-ext/string/#/contains')
  , d                   = require('d')
  , deferred            = require('deferred')
  , memoize             = require('memoizee')
  , serializeValue      = require('dbjs/_setup/serialize/value')
  , unserializeValue    = require('dbjs/_setup/unserialize/value')
  , ObservableSet       = require('observable-set/primitive')
  , mano                = require('mano')
  , QueryHandler        = require('../../utils/query-handler')
  , defaultItemsPerPage = require('../../conf/objects-list-items-per-page')
  , getDbSet            = require('../utils/get-db-set')
  , getDbArray          = require('../utils/get-db-array')
  , getIndexMap         = require('../utils/get-db-sort-index-map')
  , stepsMap            = require('../../utils/processing-steps-map')
  , listItemsPerPage    = require('mano').env.objectsListItemsPerPage
  , timeRanges          = require('../../utils/supervisor-time-ranges')
  , someRight           = require('es5-ext/array/#/some-right')

  , hasBadWs       = RegExp.prototype.test.bind(/\s{2,}/)
  , compareStamps  = function (a, b) { return a.stamp - b.stamp; }
  , isArray        = Array.isArray, slice = Array.prototype.slice, push = Array.prototype.push
  , ceil           = Math.ceil, create = Object.create
  , defineProperty = Object.defineProperty, stringify = JSON.stringify;

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

var getFilteredSet = memoize(function (baseSet, filterString) {
	var set = new ObservableSet(), baseSetListener, indexListener
	  , def = deferred(), count = 0, isInitialized = false;
	var filter = function (ownerId, data) {
		var value = unserializeValue(data.value);
		if (value && includes.call(value, filterString)) set.add(ownerId);
		else set.delete(ownerId);
	};
	var findAndFilter = function (ownerId) {
		return mano.dbDriver.getComputed(ownerId + '/searchString').aside(function (data) {
			if (!baseSet.has(ownerId)) return;
			if (!data) return;
			filter(ownerId, data);
		});
	};
	baseSet.on('change', baseSetListener = function (event) {
		if (event.type === 'add') findAndFilter(event.value).done();
		else set.delete(event.value);
	});
	mano.dbDriver.on('key:searchString', indexListener = function (event) {
		if (!baseSet.has(event.ownerId)) return;
		filter(event.ownerId, event.data);
	});
	baseSet.forEach(function (ownerId) {
		++count;
		findAndFilter(ownerId).done(function () {
			if (!--count && isInitialized) def.resolve(set);
		});
	});
	isInitialized = true;
	if (!count) def.resolve(set);
	defineProperty(set, '_dispose', d(function () {
		baseSet.off(baseSetListener);
		mano.dbDriver.off('key:searchString', indexListener);
	}));
	return def.promise;
}, { max: 1000, dispose: function (set) { set._dispose(); } });

var getDbArrayLru = memoize(function (set, sortIndexName) {
	var arr = [], itemsMap = getIndexMap(sortIndexName)
	  , count = 0, isInitialized = false, def = deferred(), setListener, itemsListener;
	var add = function (ownerId) {
		return deferred(itemsMap[ownerId] || mano.dbDriver.getComputed(ownerId + '/' + sortIndexName))
			.aside(function (data) {
				if (!set.has(ownerId)) return;
				if (!itemsMap[ownerId]) itemsMap[ownerId] = { id: ownerId, stamp: data.stamp };
				arr.push(itemsMap[ownerId]);
				if (def.resolved) arr.sort(compareStamps);
			});
	};
	set.on('change', setListener = function (event) {
		if (event.type === 'add') add(event.value).done();
		else remove.call(arr, itemsMap[event.value]);
	});
	itemsMap.on('update', itemsListener = function (event) {
		if (!set.has(event.ownerId)) return;
		if (def.resolved) arr.sort(compareStamps);
	});
	set.forEach(function (ownerId) {
		++count;
		add(ownerId).done(function () {
			if (!--count && isInitialized) def.resolve(arr.sort(compareStamps));
		});
	});
	isInitialized = true;
	if (!count) def.resolve(arr.sort(compareStamps));
	defineProperty(set, '_dispose', d(function () {
		set.off(setListener);
		itemsMap.off(itemsListener);
	}));
	return def.promise;
}, { max: 1000, dispose: function (arr) { arr._dispose(); } });
//TODO: No conf needed, we do everything in place
var initializeHandler = function (conf) {
	conf = normalizeOptions(ensureObject(conf));

	var statusIndexName     = ensureString(conf.indexName)
	//TODO: We define the properties for the lists in eregistrations
	  , bpListProps         = null
	  , bpListComputedProps = null
	  , tableQueryHandler   = getTableQueryHandler(stepsMap)
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
		// In case of !query.step we should take value from db.views.supervisor.all
		promise = getDbSet('computed', stepsMap[query.step].indexName,
			serializeValue(stepsMap[query.step].indexValue));

		return promise(function (baseSet) {
			if (!query.search) {
				return getDbArray(baseSet, 'computed', stepsMap[query.step].indexName).then(function (arr) {
					var result = [];
					if (!timeThreshold) return arr;
					arr.forEach(function (item) {
						var timeValue = Date.now() - (item.stamp / 1000);
						if (timeValue >= timeThreshold) {
							result.push(item);
						}
					});
					return result;
				});
			}

			return deferred.map(query.search.split(/\s+/).sort(), function (value) {
				return getFilteredSet(baseSet, value)(function (set) {
					return getDbArrayLru(set);
				});
			})(function (arrays) {
				if (arrays.length === 1) return arrays[0];

				return uniq.call(arrays.reduce(function (current, next, index) {
					if (index === 1) current = aFrom(current);
					push.apply(current, next);
					return current;
				})).sort(compareStamps);
			});
		})(function (arr) {
			var size = arr.length, pageCount, offset, computedEvents, directEvents, statuses, stepsMap;
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
				return mano.dbDriver.getObject(data.id, { keyPaths: bpListProps })(function (datas) {
					return datas.map(function (data) {
						return data.data.stamp + '.' + data.id + '.' + data.data.value;
					});
				});
			});
			if (!query.step) {
				stepsMap = create(null);
				statuses = deferred.map(arr, function (data) {
					return mano.dbDriver.getComputed(data.id + '/' + statusIndexName)
						.aside(function (record) {
							stepsMap[data.id] = record ? unserializeValue(record.value) : null;
						});
				})(stepsMap);
			}
			return deferred(directEvents, computedEvents, statuses)
				.spread(function (directEvents, computedEvents, stepsMap) {
					return {
						view: arr.map(function (data) {
							return data.stamp + '.' + data.id + '/processingSteps/map/' + query.step;
						}).join('\n'),
						size: size,
						data: flatten.call([directEvents, computedEvents]),
						statusMap: stepsMap
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
//TODO: No conf, we can figure everything internally
module.exports = exports = function (/*, options */) {
	var resolveHandler, getHandlerByRole;
	resolveHandler = (function () {
		var map = {};
		Object.keys(stepsMap).forEach(function (key) {
			map[key] = initializeHandler(stepsMap[key]);
		});
		getHandlerByRole = function (stepName) {
			var handler;
			if (stepName) {
				handler = map[stepName];
			}
			if (!handler) {
				throw new Error("Cannot resolve stepName for: " + stringify(stepName));
			}
			return handler;
		};

		return function (req) {
			return deferred(getHandlerByRole(req.query.step));
		};
	}());

	return {
		// we query processing steps instead of businessProcesses
		'get-processing-steps-view': function (query) {
			return resolveHandler(this.req)(function (handler) {
				// Get snapshot of business processes table page
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
