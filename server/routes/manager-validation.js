// Users admin GET controllers

'use strict';

var and                 = require('es5-ext/array/#/intersection')
  , flatten             = require('es5-ext/array/#/flatten')
  , remove              = require('es5-ext/array/#/remove')
  , uniq                = require('es5-ext/array/#/uniq')
  , isNaturalNumber     = require('es5-ext/number/is-natural')
  , toNaturalNumber     = require('es5-ext/number/to-pos-integer')
  , assign              = require('es5-ext/object/assign')
  , normalizeOptions    = require('es5-ext/object/normalize-options')
  , toArray             = require('es5-ext/object/to-array')
  , aFrom               = require('es5-ext/array/from')
  , ensureObject        = require('es5-ext/object/valid-object')
  , ensureSet           = require('es6-set/valid-set')
  , includes            = require('es5-ext/string/#/contains')
  , d                   = require('d')
  , deferred            = require('deferred')
  , memoize             = require('memoizee')
  , ObservableSet       = require('observable-set/primitive')
  , unserializeValue    = require('dbjs/_setup/unserialize/value')
  , mano                = require('mano')
  , QueryHandler        = require('../../utils/query-handler')
  , defaultItemsPerPage = require('../../conf/objects-list-items-per-page')
  , getDbSet            = require('../utils/get-db-set')
  , getDbArray          = require('../utils/get-db-array')
  , getIndexMap         = require('../utils/get-db-sort-index-map')
  , getBaseRoutes       = require('./base')

  , hasBadWs = RegExp.prototype.test.bind(/\s{2,}/)
  , slice = Array.prototype.slice, ceil = Math.ceil
  , defineProperty = Object.defineProperty, stringify = JSON.stringify
  , compareStamps = function (a, b) { return a.stamp - b.stamp; };

var userQueryHandler = new QueryHandler([{
	name: 'id',
	ensure: function (value) {
		if (!value) throw new Error("Missing id");
		mano.dbDriver.getStorage('user').get(value + '/roles*manager')(function (data) {
			if (!data || (data.value !== '11')) return;
			return value;
		});
	}
}]);

var getFilteredSet = memoize(function (baseSet, filterString, storage) {
	var set = new ObservableSet(), baseSetListener, indexListener
	  , def = deferred(), count = 0, isInitialized = false;
	var filter = function (ownerId, data) {
		var value = unserializeValue(data.value);
		if (value && includes.call(value, filterString)) set.add(ownerId);
		else set.delete(ownerId);
	};
	var findAndFilter = function (ownerId) {
		return storage.getComputed(ownerId + '/searchString').aside(function (data) {
			if (!baseSet.has(ownerId)) return;
			if (!data) return;
			filter(ownerId, data);
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
	storage.on('key:searchString', indexListener);
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
		storage.off('key:searchString', indexListener);
	}));
	return def.promise;
}, { length: 2, max: 1000, dispose: function (set) { set._dispose(); } });

var getDbArrayLru = memoize(function (set, storage) {
	var arr = [], itemsMap = getIndexMap(storage)
	  , count = 0, isInitialized = false, def = deferred(), setListener, itemsListener;
	var add = function (ownerId) {
		var promise;
		if (itemsMap[ownerId]) {
			promise = deferred(itemsMap[ownerId]);
		} else {
			promise = storage.get(ownerId);
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
}, { length: 1, max: 1000, dispose: function (arr) { arr._dispose(); } });

module.exports = exports = function (data) {
	data = normalizeOptions(ensureObject(data));
	var listProps = ensureSet(data.listProperties)
	  , listComputedProperties = data.listComputedProperties && aFrom(data.listComputedProperties)
	  , tableQueryHandler = new QueryHandler(exports.tableQueryConf)
	  , itemsPerPage = toNaturalNumber(data.itemsPerPage) || defaultItemsPerPage;

	var getTableData = memoize(function (query) {
		var storage = mano.dbDriver.getStorage('user');

		return getDbSet(storage, 'direct', 'roles', '3manager')(function (baseSet) {
			if (!query.search) return getDbArray(baseSet, storage, 'direct', null);
			return deferred.map(query.search.split(/\s+/).sort(), function (value) {
				return getFilteredSet(baseSet, value, storage)(function (set) {
					return getDbArrayLru(set, storage);
				});
			})(function (arrays) {
				if (arrays.length === 1) return arrays[0];

				return arrays.reduce(function (current, next, index) {
					if (index === 1) current = aFrom(current);
					return and.call(current, next);
				}).sort(compareStamps);
			});
		})(function (arr) {
			var pageCount, offset, size = arr.length, computedEvents, directEvents;
			if (!size) return { size: size };
			pageCount = ceil(size / itemsPerPage);
			if (query.page > pageCount) return { size: size };

			// Pagination
			offset = (query.page - 1) * itemsPerPage;
			arr = slice.call(arr, offset, offset + itemsPerPage);

			if (listComputedProperties) {
				computedEvents = deferred.map(arr, function (data) {
					var objId = data.id;
					return deferred.map(listComputedProperties, function (keyPath) {
						return storage.getComputed(objId + '/' + keyPath)(function (data) {
							if (!data) return;
							if (Array.isArray(data.value)) {
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
				return storage.getObject(data.id, { keyPaths: listProps })(function (datas) {
					return datas.map(function (data) {
						return data.data.stamp + '.' + data.id + '.' + data.data.value;
					});
				});
			});
			return deferred(directEvents, computedEvents)
				.spread(function (directEvents, computedEvents) {
					return {
						view: arr.map(function (data) { return data.stamp + '.' + data.id; }).join('\n'),
						size: size,
						data: flatten.call([directEvents, computedEvents]).filter(Boolean)
					};
				});
		});
	}, {
		normalizer: function (args) { return String(toArray(args[0], null, null, true)); },
		maxAge: 10 * 1000
	});

	return assign({
		'get-users-view': function (query) {
			return tableQueryHandler.resolve(query)(function (query) { return getTableData(query); });
		},
		'get-user-data': function (query) {
			return userQueryHandler.resolve(query)(function (query) {
				var recordId;
				if (!query.id || (this.req.$user === query.id)) return { passed: false };
				recordId = this.req.$user + '/recentlyVisited/users*7' + query.id;
				return mano.dbDriver.getStorage('user').store(recordId, '11')({ passed: true });
			}.bind(this));
		}
	}, getBaseRoutes());
};

exports.tableQueryConf = [
	{
		name: 'page',
		ensure: function (value) {
			var num;
			if (isNaN(value)) throw new Error("Unrecognized page value " + stringify(value));
			num = Number(value);
			if (!isNaturalNumber(num)) throw new Error("Unreconized page value " + stringify(value));
			if (!num) throw new Error("Unexpected page value " + stringify(value));
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
	}
];
