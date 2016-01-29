// Official roles GET controllers

'use strict';

var aFrom                          = require('es5-ext/array/from')
  , flatten                        = require('es5-ext/array/#/flatten')
  , remove                         = require('es5-ext/array/#/remove')
  , uniq                           = require('es5-ext/array/#/uniq')
  , constant                       = require('es5-ext/function/constant')
  , isNaturalNumber                = require('es5-ext/number/is-natural')
  , toNaturalNumber                = require('es5-ext/number/to-pos-integer')
  , normalizeOptions               = require('es5-ext/object/normalize-options')
  , toArray                        = require('es5-ext/object/to-array')
  , ensureObject                   = require('es5-ext/object/valid-object')
  , ensureString                   = require('es5-ext/object/validate-stringifiable-value')
  , includes                       = require('es5-ext/string/#/contains')
  , uncapitalize                   = require('es5-ext/string/#/uncapitalize')
  , d                              = require('d')
  , ensureSet                      = require('es6-set/valid-set')
  , deferred                       = require('deferred')
  , memoize                        = require('memoizee')
  , serializeValue                 = require('dbjs/_setup/serialize/value')
  , unserializeValue               = require('dbjs/_setup/unserialize/value')
  , ObservableSet                  = require('observable-set/primitive')
  , mano                           = require('mano')
  , roleNameMap                    = require('mano/lib/server/user-role-name-map')
  , QueryHandler                   = require('../../utils/query-handler')
  , defaultItemsPerPage            = require('../../conf/objects-list-items-per-page')
  , getDbSet                       = require('../utils/get-db-set')
  , getDbArray                     = require('../utils/get-db-array')
  , getIndexMap                    = require('../utils/get-db-sort-index-map')
  , businessProcessStoragesPromise = require('../utils/business-process-storages')
  , idToStorage                    = require('../utils/business-process-id-to-storage')

  , hasBadWs = RegExp.prototype.test.bind(/\s{2,}/)
  , compareStamps = function (a, b) { return a.stamp - b.stamp; }
  , isArray = Array.isArray, slice = Array.prototype.slice, push = Array.prototype.push
  , ceil = Math.ceil, create = Object.create
  , defineProperty = Object.defineProperty, stringify = JSON.stringify
  , businessProcessStorages, businessProcessStorageNames;

businessProcessStoragesPromise.done(function (storages) {
	businessProcessStorages = storages;
	businessProcessStorageNames = storages.map(function (storage) { return storage.name; });
});

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
			ensure: function (ownerId) {
				if (!ownerId) throw new Error("Missing id");
				return idToStorage(ownerId)(function (storage) {
					if (!storage) return null;
					return storage.getComputed(ownerId + '/' + indexName)(function (data) {
						if (!data || (data.value !== '11')) return null;
						return ownerId;
					});
				});
			}
		}
	]);
};

var getFilteredSet = memoize(function (baseSet, filterString, storages) {
	var set = new ObservableSet(), baseSetListener, indexListener
	  , def = deferred(), count = 0, isInitialized = false;
	var filter = function (ownerId, data) {
		var value = unserializeValue(data.value);
		if (value && includes.call(value, filterString)) set.add(ownerId);
		else set.delete(ownerId);
	};
	var findAndFilter = function (ownerId) {
		return idToStorage(ownerId)(function (storage) {
			if (!storage) return;
			return storage.getComputed(ownerId + '/searchString').aside(function (data) {
				if (!baseSet.has(ownerId)) return;
				if (!data) return;
				filter(ownerId, data);
			});
		});
	};
	baseSet.on('change', baseSetListener = function (event) {
		if (event.type === 'add') findAndFilter(event.value).done();
		else set.delete(event.value);
	});
	indexListener = function (event) {
		if (!baseSet.has(event.ownerId)) return;
		filter(event.ownerId, event.data);
	};
	storages.forEach(function (storage) { storage.on('key:searchString', indexListener); });
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
		storages.forEach(function (storage) { storage.off('key:searchString', indexListener); });
	}));
	return def.promise;
}, { length: 2, max: 1000, dispose: function (set) { set._dispose(); } });

var getDbArrayLru = memoize(function (set, sortIndexName, storageName) {
	var arr = [], itemsMap = getIndexMap(storageName, sortIndexName)
	  , count = 0, isInitialized = false, def = deferred(), setListener, itemsListener;
	var add = function (ownerId) {
		var promise;
		if (itemsMap[ownerId]) {
			promise = deferred(itemsMap[ownerId]);
		} else {
			promise = idToStorage(ownerId)(function (storage) {
				if (!storage) return;
				return storage.getComputed(ownerId + '/' + sortIndexName);
			});
		}
		return promise.aside(function (data) {
			if (!set.has(ownerId)) return;
			if (!itemsMap[ownerId]) itemsMap[ownerId] = { id: ownerId, stamp: data ? data.stamp : 0 };
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
}, { length: 2, max: 1000, dispose: function (arr) { arr._dispose(); } });

var initializeHandler = function (conf) {
	conf = normalizeOptions(ensureObject(conf));

	var roleName            = ensureString(conf.roleName)
	  , statusMap           = ensureObject(conf.statusMap)
	  , statusIndexName     = ensureString(conf.statusIndexName)
	  , allIndexName        = statusMap.all.indexName
	  , bpListProps         = ensureSet(conf.listProperties)
	  , bpListComputedProps = conf.listComputedProperties && aFrom(conf.listComputedProperties)
	  , tableQueryHandler   = getTableQueryHandler(statusMap)
	  , itemsPerPage        = toNaturalNumber(conf.itemsPerPage) || defaultItemsPerPage
	  , businessProcessQueryHandler = getBusinessProcessQueryHandler(allIndexName)
	  , storageName, storages;

	if (conf.storageName != null) {
		storageName = conf.storageName;
		if (isArray(storageName)) {
			storages = storageName.map(function (storageName) {
				return mano.dbDriver.getStorage(ensureString(storageName));
			});
		} else {
			storages = [mano.dbDriver.getStorage(storageName)];
		}
	} else {
		storageName = businessProcessStorageNames;
		storages = businessProcessStorages;
	}

	var getTableData = memoize(function (query) {
		var indexMeta = exports.getIndexMeta(query, statusMap), promise;

		if (isArray(indexMeta)) {
			promise = deferred.map(indexMeta.sort(compareIndexMeta), function (indexMeta) {
				return getDbSet(storages, 'computed', indexMeta.name, indexMeta.value);
			})(function (sets) {
				return aFrom(sets).reduce(function (set1, set2) { return set1.and(set2); });
			});
		} else {
			promise = getDbSet(storages, 'computed', indexMeta.name, indexMeta.value);
		}

		if (query.assignedTo) {
			promise = promise.then(function (baseSet) {
				return getDbSet(storages, 'direct', conf.assigneePath, '7' +
					query.assignedTo)(function (set) { return baseSet.and(set); });
			});
		}

		return promise(function (baseSet) {
			if (!query.search) return getDbArray(baseSet, storageName, 'computed', allIndexName);
			return deferred.map(query.search.split(/\s+/).sort(), function (value) {
				return getFilteredSet(baseSet, value, storages)(function (set) {
					return getDbArrayLru(set, allIndexName, storageName);
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
						return idToStorage(objId)(function (storage) {
							if (!storage) return;
							return storage.getComputed(objId + '/' + keyPath)(function (data) {
								if (!data) return;
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
				});
			} else {
				computedEvents = [];
			}
			directEvents = deferred.map(arr, function (data) {
				return idToStorage(data.id)(function (storage) {
					if (!storage) return null;
					return storage.getObject(data.id, { keyPaths: bpListProps })(function (datas) {
						return datas.map(function (data) {
							return data.data.stamp + '.' + data.id + '.' + data.data.value;
						});
					});
				});
			});
			if (!query.status) {
				statusMap = create(null);
				statuses = deferred.map(arr, function (data) {
					return idToStorage(data.id)(function (storage) {
						if (!storage) return null;
						return storage.getComputed(data.id + '/' + statusIndexName).aside(function (record) {
							statusMap[data.id] = record ? unserializeValue(record.value) : null;
						});
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
		roleName: roleName,
		assigneePath: conf.assigneePath
	};
};

module.exports = exports = function (mainConf/*, options */) {
	var resolveHandler, options, roleNameResolve, getHandlerByRole;
	options = Object(arguments[1]);
	if (isArray(mainConf)) {
		resolveHandler = (function () {
			var map = mainConf.reduce(function (map, conf) {
				map[conf.roleName] = initializeHandler(conf);
				return map;
			}, create(null));
			getHandlerByRole = function (roleName) {
				var handler;
				if (roleName) {
					handler = map[roleName];
				}
				if (!handler) {
					throw new Error("Cannot resolve conf for role name: " + stringify(roleName));
				}
				return handler;
			};
			if (options.resolveConf && (typeof options.resolveConf === 'function')) {
				roleNameResolve = function (req) {
					return deferred(options.resolveConf(req)).then(getHandlerByRole);
				};
			} else {
				roleNameResolve = function (req) {
					return roleNameMap.get(req.$user)(function (roleName) {
						if (!roleName) return;
						roleName = unserializeValue(roleName);
						return getHandlerByRole(uncapitalize.call(roleName.slice('official'.length)));
					});
				};
			}
			return businessProcessStoragesPromise(function () { return roleNameResolve; });
		}());
	} else {
		resolveHandler = constant(businessProcessStoragesPromise(function () {
			return initializeHandler(mainConf);
		}));
	}
	return {
		'get-business-processes-view': function (query) {
			var userId = this.req.$user;
			return resolveHandler(this.req)(function (handler) {
				// Get snapshot of business processes table page
				return handler.tableQueryHandler.resolve(query)(function (query) {
					if (handler.assigneePath) {
						query.assignedTo = userId;
					}
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
					return mano.dbDriver.getStorage('user').store(recordId, '11')({ passed: true });
				}.bind(this));
			}.bind(this));
		}
	};
};

exports.getIndexMeta = function (query, meta) {
	var status = query.status || 'all';

	return {
		name: meta[status].indexName,
		value: serializeValue(meta[status].indexValue)
	};
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
