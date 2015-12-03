// Official roles GET controllers

'use strict';

var aFrom               = require('es5-ext/array/from')
  , flatten             = require('es5-ext/array/#/flatten')
  , remove              = require('es5-ext/array/#/remove')
  , uniq                = require('es5-ext/array/#/uniq')
  , constant            = require('es5-ext/function/constant')
  , isNaturalNumber     = require('es5-ext/number/is-natural')
  , toNaturalNumber     = require('es5-ext/number/to-pos-integer')
  , normalizeOptions    = require('es5-ext/object/normalize-options')
  , toArray             = require('es5-ext/object/to-array')
  , ensureCallable      = require('es5-ext/object/valid-callable')
  , ensureObject        = require('es5-ext/object/valid-object')
  , ensureString        = require('es5-ext/object/validate-stringifiable-value')
  , includes            = require('es5-ext/string/#/contains')
  , uncapitalize        = require('es5-ext/string/#/uncapitalize')
  , d                   = require('d')
  , ensureSet           = require('es6-set/valid-set')
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

  , hasBadWs = RegExp.prototype.test.bind(/\s{2,}/)
  , compareStamps = function (a, b) { return a.stamp - b.stamp; }
  , db = mano.db
  , isArray = Array.isArray, slice = Array.prototype.slice, push = Array.prototype.push
  , ceil = Math.ceil, create = Object.create
  , defineProperty = Object.defineProperty, stringify = JSON.stringify;

var compareIndexMeta = function (meta1, meta2) {
	return meta1.name.localeCompare(meta2.name) || meta1.value.localeCompare(meta2.value);
};

// Business processes table query handler
var getTableQueryHandler = function (statusMap) {
	var queryHandler = new QueryHandler(exports.tableQueryConf);
	queryHandler._statusMap = statusMap;
	return queryHandler;
};

// Single business process full data query handler
var getBusinessProcessQueryHandler = function (indexName) {
	return new QueryHandler([
		{
			name: 'id',
			ensure: function (value) {
				if (!value) throw new Error("Missing id");
				return mano.dbDriver.getComputed(value + '/' + indexName)(function (data) {
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
			filter(ownerId, data);
		});
	};
	baseSet.on('change', baseSetListener = function (event) {
		if (event.type === 'add') findAndFilter(event.value).done();
		else set.delete(event.value);
	});
	mano.dbDriver.on('computed:searchString', indexListener = function (event) {
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
		mano.dbDriver.off('computed:searchString', indexListener);
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

var initializeHandler = function (conf) {
	conf = normalizeOptions(ensureObject(conf));
	var roleName = ensureString(conf.roleName)
	  , statusIndexName = ensureString(conf.statusIndexName)
	  , allIndexName = ensureString(conf.allIndexName)
	  , bpListProps = ensureSet(conf.listProperties)
	  , bpListComputedProps = conf.listComputedProperties && aFrom(conf.listComputedProperties)
	  , tableQueryHandler = getTableQueryHandler(ensureObject(conf.statusMap))
	  , businessProcessQueryHandler = getBusinessProcessQueryHandler(conf.allIndexName)
	  , itemsPerPage = toNaturalNumber(conf.itemsPerPage) || defaultItemsPerPage
	  , indexes;

	if (conf.resolveCollectionMeta != null) ensureCallable(conf.resolveCollectionMeta);

	if (bpListComputedProps) {
		indexes = [];
		deferred.map(bpListComputedProps, function (keyPath) {
			return mano.dbDriver.indexKeyPath(keyPath)(function (map) {
				indexes.push({ keyPath: keyPath, map: map });
			});
		});
	}

	var getTableData = memoize(function (query) {
		var indexMeta = exports.getIndexMeta(query, conf), promise;
		if (isArray(indexMeta)) {
			promise = deferred.map(indexMeta.sort(compareIndexMeta), function (indexMeta) {
				return getDbSet('computed', indexMeta.name, indexMeta.value);
			})(function (sets) {
				return aFrom(sets).reduce(function (set1, set2) { return set1.and(set2); });
			});
		} else {
			promise = getDbSet('computed', indexMeta.name, indexMeta.value);
		}
		return promise(function (baseSet) {
			if (!query.search) return getDbArray(baseSet, 'computed', allIndexName);
			return deferred.map(query.search.split(/\s+/).sort(), function (value) {
				return getFilteredSet(baseSet, value)(function (set) {
					return getDbArrayLru(set, allIndexName);
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
			var size = arr.length, pageCount, offset, computedEvents, directEvents, statuses, statusMap;
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
				return mano.dbDriver.getDirectObject(data.id, { keyPaths: bpListProps })(function (datas) {
					return datas.map(function (data) {
						return data.data.stamp + '.' + data.id + '.' + data.data.value;
					});
				});
			});
			if (!query.status) {
				statusMap = create(null);
				statuses = deferred.map(arr, function (data) {
					return mano.dbDriver.getComputed(data.id + '/' + statusIndexName)
						.aside(function (record) {
							statusMap[data.id] = record ? unserializeValue(record.value) : null;
						});
				})(statusMap);
			}
			return deferred(directEvents, computedEvents, statuses)
				.spread(function (directEvents, computedEvents, statusMap) {
					return {
						view: arr.map(function (data) { return data.stamp + '.' + data.id; }).join('\n'),
						size: size,
						data: flatten.call([directEvents, computedEvents]),
						statusMap: statusMap
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
		businessProcessQueryHandler: businessProcessQueryHandler,
		roleName: roleName
	};
};

module.exports = exports = function (mainConf) {
	var resolveHandler;
	if (isArray(mainConf)) {
		resolveHandler = (function () {
			var map = mainConf.reduce(function (map, conf) {
				map[conf.roleName] = initializeHandler(conf);
				return map;
			}, create(null));
			return function (userId) {
				var handler, roleName = uncapitalize.call(db.User.getById(userId)
					.currentRoleResolved.slice('official'.length));
				handler = map[roleName];
				if (!handler) throw new Error("Cannot resolve conf for role name: " + stringify(roleName));
				return handler;
			};
		}());
	} else {
		resolveHandler = constant(initializeHandler(mainConf));
	}
	return {
		'get-business-processes-view': function (query) {
			var handler = resolveHandler(this.req.$user);
			// Get snapshot of business processes table page
			return handler.tableQueryHandler.resolve(query)(function (query) {
				return handler.getTableData(query);
			});
		},
		'get-business-process-data': function (query) {
			var handler = resolveHandler(this.req.$user);
			// Get full data of one of the business processeses
			return handler.businessProcessQueryHandler.resolve(query)(function (query) {
				if (!query.id) return { passed: false };
				// Put business process to top in visitedBusinessProcesses LRU queue
				db.User.getById(this.req.$user).visitedBusinessProcesses[handler.roleName]
					.add(db.BusinessProcess.getById(query.id));
				return { passed: true };
			}.bind(this));
		}
	};
};

exports.getIndexMeta = function (query, conf) {
	var meta;
	if (query.status) {
		if (conf.resolveCollectionMeta) {
			meta = conf.resolveCollectionMeta(query.status);
			return { name: meta.name, value: serializeValue(meta.value) };
		}
		return { name: conf.statusIndexName, value: serializeValue(query.status) };
	}
	return { name: conf.allIndexName, value: '11' };
};

exports.tableQueryConf = [{
	name: 'status',
	ensure: function (value) {
		if (!value) return;
		if (!this._statusMap[value]) {
			throw new Error("Unreconized status value " + stringify(value));
		}
		if (value === 'all') throw new Error("Unexpected default key status");
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
