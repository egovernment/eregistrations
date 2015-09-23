// Official roles GET controllers

'use strict';

var aFrom           = require('es5-ext/array/from')
  , ensureArray     = require('es5-ext/array/valid-array')
  , flatten         = require('es5-ext/array/#/flatten')
  , ensureObject    = require('es5-ext/object/valid-object')
  , ensureCallable  = require('es5-ext/object/valid-callable')
  , ensureDatabase  = require('dbjs/valid-dbjs')
  , getCompare      = require('../../utils/get-compare')
  , getSearchFilter = require('../../utils/get-search-filter')
  , serializeView   = require('../../utils/db-view/serialize')
  , getEvents       = require('../../utils/dbjs-get-path-events')
  , getQueryHandler = require('../business-processes-table/get-query-handler')

  , map = Array.prototype.map, ceil = Math.ceil
  , itemsPerPage = 50;

module.exports = function (data) {
	ensureObject(data);
	var statusMap = ensureObject(data.statusMap)
	  , bpListProps = aFrom(data.listProperties)
	  , bpListComputedProps = data.listComputedProperties && aFrom(data.listComputedProperties)
	  , searchFilter = getSearchFilter(ensureArray(data.searchablePropertyNames))
	  , queryHandler = getQueryHandler(statusMap)
	  , dbSubmitted = bpListComputedProps ? ensureDatabase(data.dbSubmitted) : null
	  , getOrderIndex = ensureCallable(data.getOrderIndex);

	return {
		'get-business-processes-view': function (query) {
			var list, pageCount, offset, size;
			query = queryHandler.resolve(query);
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
