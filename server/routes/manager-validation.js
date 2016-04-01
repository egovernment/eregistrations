// Users admin GET controllers

'use strict';

var flatten             = require('es5-ext/array/#/flatten')
  , isNaturalNumber     = require('es5-ext/number/is-natural')
  , toNaturalNumber     = require('es5-ext/number/to-pos-integer')
  , normalizeOptions    = require('es5-ext/object/normalize-options')
  , toArray             = require('es5-ext/object/to-array')
  , aFrom               = require('es5-ext/array/from')
  , ensureObject        = require('es5-ext/object/valid-object')
  , ensureSet           = require('es6-set/valid-set')
  , includes            = require('es5-ext/string/#/contains')
  , deferred            = require('deferred')
  , memoize             = require('memoizee/plain')
  , mano                = require('mano')
  , QueryHandler        = require('../../utils/query-handler')
  , defaultItemsPerPage = require('../../conf/objects-list-items-per-page')
  , getDbSet            = require('../utils/get-db-set')
  , getDbArray          = require('../utils/get-db-array')
  , hasBadWs            = RegExp.prototype.test.bind(/\s{2,}/)
  , uniq                = require('es5-ext/array/#/uniq')
  , unserializeValue    = require('dbjs/_setup/unserialize/value')
  , slice = Array.prototype.slice, ceil = Math.ceil
  , push  = Array.prototype.push
  , stringify = JSON.stringify
  , compareStamps = function (a, b) { return a.stamp - b.stamp; };

require('memoizee/ext/max-age');

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

var getFilteredArray = function (storage, arr, filterString) {
	var result = [];

	var filter = function (data, searchData) {
		if (!searchData) return;
		var value = unserializeValue(searchData.value);
		if (value && includes.call(value, filterString)) result.push(data);
	};
	var findAndFilter = function (data) {
		return storage.getComputed(data.id + '/searchString')(function (searchData) {
			filter(data, searchData);
		});
	};
	return deferred.map(arr, findAndFilter).then(function () {
		return deferred(result);
	});
};

module.exports = exports = function (data) {
	data = normalizeOptions(ensureObject(data));
	var listProps = ensureSet(data.listProperties)
	  , listComputedProperties = data.listComputedProperties && aFrom(data.listComputedProperties)
	  , tableQueryHandler = new QueryHandler(exports.tableQueryConf)
	  , itemsPerPage = toNaturalNumber(data.itemsPerPage) || defaultItemsPerPage;

	var getTableData = memoize(function (query) {
		var storage = mano.dbDriver.getStorage('user');
		return getDbSet(storage, 'direct', 'roles', '3manager')(function (set) {
			return getDbArray(set, storage, 'direct', null)(function (arr) {
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
		});
	}, {
		normalizer: function (args) { return String(toArray(args[0], null, null, true)); },
		maxAge: 10 * 1000
	});

	return {
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
	};
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
