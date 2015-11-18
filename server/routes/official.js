// Official roles GET controllers

'use strict';

var aFrom               = require('es5-ext/array/from')
  , arrayToArray        = require('es5-ext/array/to-array')
  , ensureArray         = require('es5-ext/array/valid-array')
  , find                = require('es5-ext/array/#/find')
  , flatten             = require('es5-ext/array/#/flatten')
  , uniq                = require('es5-ext/array/#/uniq')
  , isNaturalNumber     = require('es5-ext/number/is-natural')
  , toNaturalNumber     = require('es5-ext/number/to-pos-integer')
  , normalizeOptions    = require('es5-ext/object/normalize-options')
  , toArray             = require('es5-ext/object/to-array')
  , ensureObject        = require('es5-ext/object/valid-object')
  , ensureCallable      = require('es5-ext/object/valid-callable')
  , ensureString        = require('es5-ext/object/validate-stringifiable-value')
  , Set                 = require('es6-set')
  , deferred            = require('deferred')
  , memoize             = require('memoizee/plain')
  , ensureDriver        = require('dbjs-persistence/ensure')
  , isObservableSet     = require('observable-set/is-observable-set')
  , db                  = require('mano').db
  , getCompare          = require('../../utils/get-compare')
  , getSearchFilter     = require('../../utils/get-search-filter')
  , serializeView       = require('../../utils/db-view/serialize')
  , getEvents           = require('../../utils/dbjs-get-path-events')
  , QueryHandler        = require('../../utils/query-handler')
  , smartSearchFilter   = require('../../utils/smart-search-filter')
  , defaultItemsPerPage = require('../../conf/objects-list-items-per-page')

  , hasBadWs = RegExp.prototype.test.bind(/\s{2,}/)
  , isArray = Array.isArray, map = Array.prototype.map, ceil = Math.ceil, keys = Object.keys
  , stringify = JSON.stringify;

require('memoizee/ext/max-age');

// Business processes table query handler
var getTableQueryHandler = function (statusMap) {
	var queryHandler = new QueryHandler(exports.tableQueryConf);
	queryHandler._statusMap = statusMap;
	return queryHandler;
};

// Single business process full data query handler
var getBusinessProcessQueryHandler = function (statusMap) {
	return new QueryHandler([
		{
			name: 'id',
			ensure: function (value) {
				var bp;
				if (!value) throw new Error("Missing id");
				bp = db.BusinessProcess.getById(value);
				if (!bp) return null;
				if (!statusMap.all.data.has(bp)) return null;
				return value;
			}
		}
	]);
};

module.exports = exports = function (data) {
	data = normalizeOptions(ensureObject(data));
	var roleName = ensureString(data.roleName)
	  , statusMap = ensureObject(data.statusMap)
	  , bpListProps = aFrom(data.listProperties)
	  , bpListComputedProps = data.listComputedProperties && aFrom(data.listComputedProperties)
	  , tableQueryHandler = getTableQueryHandler(statusMap)
	  , businessProcessQueryHandler = getBusinessProcessQueryHandler(statusMap)
	  , dbDriver = bpListComputedProps ? ensureDriver(data.dbDriver) : null
	  , getOrderIndex = ensureCallable(data.getOrderIndex)
	  , compare = getCompare(getOrderIndex)
	  , statuses = keys(statusMap).filter(function (name) { return (name !== 'all'); })
	  , itemsPerPage = toNaturalNumber(data.itemsPerPage) || defaultItemsPerPage
	  , indexes;

	if (bpListComputedProps) {
		indexes = [];
		deferred.map(bpListComputedProps, function (keyPath) {
			return dbDriver.indexKeyPath(keyPath)(function (map) {
				indexes.push({ keyPath: keyPath, map: map });
			});
		});
	}

	data.searchFilter = getSearchFilter(ensureArray(data.searchablePropertyNames));
	var getTableData = memoize(function (query) {
		var list, pageCount, offset, size, result, computedEvents;
		list = exports.listModifiers.reduce(function (list, modifier) {
			if (modifier.name && (query[modifier.name] == null) && !modifier.required) return list;
			return modifier.process(list, query[modifier.name], data);
		}, null);
		size = list.size;
		if (!size) return { size: size };
		pageCount = ceil(size / itemsPerPage);
		if (query.page > pageCount) return { size: size };
		// Sort
		list = isObservableSet(list) ? list.toArray(compare) : arrayToArray(list).sort(compare);
		// Pagination
		offset = (query.page - 1) * itemsPerPage;
		list = list.slice(offset, offset + itemsPerPage);
		if (bpListComputedProps) {
			computedEvents = deferred.map(list, function (obj) {
				var objId = obj.__id__;
				return deferred.map(bpListComputedProps, function (keyPath) {
					return dbDriver.getComputed(objId + '/' + keyPath)(function (data) {
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
			computedEvents = deferred();
		}
		return computedEvents(function (computedEvents) {
			result = {
				view: serializeView(list, getOrderIndex),
				size: size,
				data: flatten.call(map.call(list, function (object) {
					var events = bpListProps.map(function (path) { return getEvents(object, path); });
					events.unshift(object._lastOwnEvent_);
					if (!computedEvents) return events;
					return [events, computedEvents];
				})).map(String)
			};
			if (!query.status) {
				list.forEach(function (bp) {
					this[bp.__id__] = find.call(statuses,
						function (status) { return statusMap[status].data.has(bp); });
				}, result.statusMap = {});
			}
			return result;
		});
	}, {
		normalizer: function (args) { return String(toArray(args[0], null, null, true)); },
		maxAge: 10 * 1000
	});

	return {
		'get-business-processes-view': function (query) {
			return getTableData(tableQueryHandler.resolve(query));
		},
		'get-business-process-data': function (query) {
			query = businessProcessQueryHandler.resolve(query);
			if (!query.id) return { passed: false };
			db.User.getById(this.req.$user).visitedBusinessProcesses[roleName]
				.add(db.BusinessProcess.getById(query.id));
			return { passed: true };
		}
	};
};
exports.listModifiers = [{
	name: 'status',
	required: true,
	process: function (ignore, value, data) { return data.statusMap[value || 'all'].data; }
}, {
	name: 'search',
	process: function (list, value, data) {
		var result;
		value = value.split(/\s+/);
		result = smartSearchFilter(list, data.searchFilter, value.shift());
		if (!value.length) return result;
		return value.reduce(function (result, value) {
			result.forEach(function (item) {
				if (!this.has(item)) result.delete(item);
			}, smartSearchFilter(list, data.searchFilter, value));
			return result;
		}, new Set(result));
	}
}];

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
