// Official roles GET controllers

'use strict';

var aFrom               = require('es5-ext/array/from')
  , ensureArray         = require('es5-ext/array/valid-array')
  , find                = require('es5-ext/array/#/find')
  , flatten             = require('es5-ext/array/#/flatten')
  , isNaturalNumber     = require('es5-ext/number/is-natural')
  , toNaturalNumber     = require('es5-ext/number/to-pos-integer')
  , normalizeOptions    = require('es5-ext/object/normalize-options')
  , toArray             = require('es5-ext/object/to-array')
  , ensureObject        = require('es5-ext/object/valid-object')
  , ensureCallable      = require('es5-ext/object/valid-callable')
  , ensureString        = require('es5-ext/object/validate-stringifiable-value')
  , memoize             = require('memoizee/plain')
  , ensureDatabase      = require('dbjs/valid-dbjs')
  , db                  = require('mano').db
  , getCompare          = require('../../utils/get-compare')
  , getSearchFilter     = require('../../utils/get-search-filter')
  , serializeView       = require('../../utils/db-view/serialize')
  , getEvents           = require('../../utils/dbjs-get-path-events')
  , QueryHandler        = require('../../utils/query-handler')
  , defaultItemsPerPage = require('../../conf/objects-list-items-per-page')

  , map = Array.prototype.map, ceil = Math.ceil, keys = Object.keys, stringify = JSON.stringify;

require('memoizee/ext/max-age');

var getTableQueryHandler = function (statusMap) {
	var queryHandler = new QueryHandler(exports.tableQueryConf);
	queryHandler._statusMap = statusMap;
	return queryHandler;
};

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
	  , dbSubmitted = bpListComputedProps ? ensureDatabase(data.dbSubmitted) : null
	  , getOrderIndex = ensureCallable(data.getOrderIndex)
	  , compare = getCompare(getOrderIndex)
	  , statuses = keys(statusMap).filter(function (name) { return (name !== 'all'); })
	  , itemsPerPage = toNaturalNumber(data.itemsPerPage) || defaultItemsPerPage;

	data.searchFilter = getSearchFilter(ensureArray(data.searchablePropertyNames));
	var getTableData = memoize(function (query) {
		var list, pageCount, offset, size, result;
		list = exports.listModifiers.reduce(function (list, modifier) {
			if (modifier.name && (query[modifier.name] == null) && !modifier.required) return list;
			return modifier.process(list, query[modifier.name], data);
		}, null);
		size = list.size;
		if (!size) return { size: size };
		pageCount = ceil(size / itemsPerPage);
		if (query.page > pageCount) return { size: size };
		// Sort
		list = list.toArray(compare);
		// Pagination
		offset = (query.page - 1) * itemsPerPage;
		list = list.slice(offset, offset + itemsPerPage);
		result = {
			view: serializeView(list, getOrderIndex),
			size: size,
			data: flatten.call(map.call(list, function (object) {
				var subObject
				  , events = bpListProps.map(function (path) { return getEvents(object, path); });
				events.unshift(object._lastOwnEvent_);
				if (!dbSubmitted) return events;
				subObject = dbSubmitted.BusinessProcess.getById(object.__id__);
				return [
					events,
					bpListComputedProps.map(function (path) { return getEvents(subObject, path); })
				];
			})).map(String)
		};
		if (!query.status) {
			list.forEach(function (bp) {
				this[bp.__id__] = find.call(statuses,
					function (status) { return statusMap[status].data.has(bp); });
			}, result.statusMap = {});
		}
		return result;
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
	process: function (list, value, data) { return list.filter(data.searchFilter(value)); }
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
