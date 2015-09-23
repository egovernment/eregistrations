// Official roles GET controllers

'use strict';

var aFrom           = require('es5-ext/array/from')
  , ensureArray     = require('es5-ext/array/valid-array')
  , flatten         = require('es5-ext/array/#/flatten')
  , isNaturalNumber = require('es5-ext/number/is-natural')
  , ensureObject    = require('es5-ext/object/valid-object')
  , ensureCallable  = require('es5-ext/object/valid-callable')
  , ensureDatabase  = require('dbjs/valid-dbjs')
  , getCompare      = require('../../utils/get-compare')
  , getSearchFilter = require('../../utils/get-search-filter')
  , serializeView   = require('../../utils/db-view/serialize')
  , getEvents       = require('../../utils/dbjs-get-path-events')
  , QueryHandler    = require('../../utils/query-handler')

  , map = Array.prototype.map, ceil = Math.ceil, stringify = JSON.stringify
  , itemsPerPage = 50;

var getTableQueryHandler = function (statusMap) {
	return new QueryHandler([
		{
			name: 'status',
			ensure: function (value) {
				if (!value) return;
				if (!statusMap[value]) {
					throw new Error("Unreconized status value " + stringify(value));
				}
				if (value === 'all') throw new Error("Unexpected default key status");
				return value;
			}
		},
		{ name: 'search' },
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
		}
	]);
};

module.exports = function (data) {
	ensureObject(data);
	var statusMap = ensureObject(data.statusMap)
	  , bpListProps = aFrom(data.listProperties)
	  , bpListComputedProps = data.listComputedProperties && aFrom(data.listComputedProperties)
	  , searchFilter = getSearchFilter(ensureArray(data.searchablePropertyNames))
	  , tableQueryHandler = getTableQueryHandler(statusMap)
	  , dbSubmitted = bpListComputedProps ? ensureDatabase(data.dbSubmitted) : null
	  , getOrderIndex = ensureCallable(data.getOrderIndex);

	return {
		'get-business-processes-view': function (query) {
			var list, pageCount, offset, size;
			query = tableQueryHandler.resolve(query);
			// Status
			list = statusMap[query.status || 'all'].data;
			// Search
			if (query.search) list = list.filter(searchFilter(query.search));
			size = list.size;
			if (!size) return { size: size };
			pageCount = ceil(size / itemsPerPage);
			if (query.page > pageCount) return { size: size };
			// Sort
			list = list.toArray(getCompare(getOrderIndex));
			// Pagination
			offset = (query.page - 1) * itemsPerPage;
			list = list.slice(offset, offset + itemsPerPage);
			return {
				view: serializeView(list, getOrderIndex),
				size: size,
				data: flatten.call(map.call(list, function (object) {
					var subObject
					  , events = bpListProps.map(function (path) { return getEvents(object, path); });
					if (!dbSubmitted) return events;
					subObject = dbSubmitted.BusinessProcess.getById(object.__id__);
					return [
						events,
						bpListComputedProps.map(function (path) { return getEvents(subObject, path); })
					];
				})).map(String)
			};
		}
	};
};
