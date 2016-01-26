// Business process dedicated list manager
// (used to handle business processes table in official roles)

'use strict';

var includes        = require('es5-ext/array/#/contains')
  , toNaturalNumber = require('es5-ext/number/to-pos-integer')
  , toArray         = require('es5-ext/object/to-array')
  , ensureObject    = require('es5-ext/object/valid-object')
  , ensureCallable  = require('es5-ext/object/valid-callable')
  , d               = require('d')
  , getSearchFilter = require('eregistrations/utils/get-search-filter')
  , memoize         = require('memoizee/plain')
  , db              = require('mano').db
  , getData         = require('mano/lib/client/xhr-driver').get
  , ListManager     = require('../objects-table/manager')
  , unserializeView = require('../../../utils/db-view/unserialize')
  , timeRanges      = require('../../../utils/supervisor-time-ranges')

  , defineProperties = Object.defineProperties;

require('memoizee/ext/max-age');

var getViewData = function (query) {
	return getData('/get-business-processes-view/', query).aside(function (result) {
		if (!result.data) return;
		result.data.forEach(function (eventStr) { db.unserializeEvent(eventStr, 'server-temporary'); });
	});
};

var SupervisorManager = module.exports = function (conf) {
	var statusMap = ensureObject(conf.statusMap)
	  , getOrderIndex = ensureCallable(conf.getOrderIndex)
	  , searchFilter = getSearchFilter
	  , itemsPerPage = toNaturalNumber(conf.itemsPerPage);

	if (itemsPerPage) this.itemsPerPage = itemsPerPage;

	defineProperties(this, {
		_statusMap: d(statusMap),
		_getItemOrderIndex: d(getOrderIndex),
		_getSearchFilter: d(searchFilter),
		_queryExternal: d(memoize(getViewData, {
			normalizer: function (args) { return String(toArray(args[0], null, null, true)); },
			maxAge: 10 * 1000
		}))
	});
};

SupervisorManager.prototype = Object.create(ListManager.prototype, {
	constructor: d(SupervisorManager),
	_type: d(db.BusinessProcess),

	// Characterics that needs to be provided per system/user:
	_statusMap: d(null),
	_getItemOrderIndex: d(null),
	_getSearchFilter: d(null),

	_isExternalQuery: d(function (query) {
		var views;
		console.log('_isExternalQuery');
		// When we have all the items, we don't need to query server
		if (!query.status || (query.status === 'all')) {
			views = db.views.supervisor.all;
		} else {
			views = db.views.pendingBusinessProcesses[query.status].pending;
		}
		if (views.totalSize <= this.itemsPerPage) return false;
		// If it's not about first page, it's only server that knows
		if (query.page > 1) return true;
		// If it's purely a first page of a status, we know
		return this._modifiers.some(function (mod) {
			return (mod.name !== 'status') && query[mod.name];
		});
	}),
	_isItemApplicable: d(function (item, query) {
		console.log('_isItemApplicable');
		if (!this._statusMap[query.status || 'all'].data.has(item)) return false;
		if (!query.search) return true;
		return query.search.split(/\s+/).every(function (value) {
			return this._getSearchFilter(value)(item);
		}, this);
	}),
	// Modifiers (used only in case of non-external list resolution)
	_modifiers: d([
		{
			name: 'status',
			required: true,
			process: function (ignore, query) {
				var views, list = [], stepViews;
				if (!query.status || (query.status === 'all')) {
					views = db.views.supervisor.all;
					list = unserializeView(views.get(1), this._type);
				} else {
					views = db.views.pendingBusinessProcesses[query.status].pending;
					stepViews = unserializeView(views.get(1), this._type);
					stepViews.forEach(function (businessProcess) {
						list.push(businessProcess.processingSteps.map[query.status]);
					});
				}

				return {
					list: list,
					size: (views.totalSize < this.itemsPerPage) ? list.length : views.totalSize
				};
			}
		},
		{
			name: 'time',
			required: true,
			process: function (data, query) {
				var list = data.list, result, threshold;
				timeRanges.some(function (item) {
					if (item.token === query.time) {
						threshold = item.value;
						return true;
					}
				});
				if (!threshold) return { list: list, size: list.length };
				result = list.filter(function (processingStep) {
					var value = new db.DateTime() -
						(new db.DateTime(processingStep._resolvedStatus.lastModified / 1000));
					return value >= threshold;
				});
				return { list: result, size: result.length };
			}
		},
		{
			name: 'search',
			process: function (data, query) {
				var value = query.search.split(/\s+/), list = data.list, result;
				result = list.filter(this._getSearchFilter(value.shift()));
				if (value.length) {
					result = value.reduce(function (result, value) {
						return result.filter(function (item) {
							return includes.call(this, item);
						}, list.filter(this._getSearchFilter(value)));
					}.bind(this), result);
				}
				return { list: result, size: result.length };
			}
		}
	])
});
