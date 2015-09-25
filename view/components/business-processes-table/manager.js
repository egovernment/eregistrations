// Business process dedicated list manager
// (used to handle business processes table in official roles)

'use strict';

var uniq            = require('es5-ext/array/#/uniq')
  , toNaturalNumber = require('es5-ext/number/to-pos-integer')
  , toArray         = require('es5-ext/object/to-array')
  , ensureObject    = require('es5-ext/object/valid-object')
  , ensureCallable  = require('es5-ext/object/valid-callable')
  , ensureString    = require('es5-ext/object/validate-stringifiable-value')
  , d               = require('d')
  , memoize         = require('memoizee/plain')
  , db              = require('mano').db
  , getData         = require('mano/lib/client/xhr-driver').get
  , ListManager     = require('../objects-table/manager')
  , resolveList     = require('../objects-table/resolve-list')

  , push = Array.prototype.push
  , defineProperties = Object.defineProperties, BusinessProcess = db.BusinessProcess;

require('memoizee/ext/max-age');

var getViewData = memoize(function (query) {
	return getData('/get-business-processes-view/', query).aside(function (result) {
		if (!result.data) return;
		result.data.forEach(function (eventStr) { db.unserializeEvent(eventStr, 'server-temporary'); });
	});
}, {
	normalizer: function (args) { return String(toArray(args[0], null, null, true)); },
	maxAge: 10 * 1000
});

var BusinessProcessesManager = module.exports = function (conf) {
	var user = db.User.validate(ensureObject(conf).user)
	  , roleName = ensureString(conf.roleName)
	  , statusMap = ensureObject(conf.statusMap)
	  , getOrderIndex = ensureCallable(conf.getOrderIndex)
	  , searchFilter = ensureCallable(conf.searchFilter)
	  , itemsPerPage = toNaturalNumber(data.itemsPerPage);

	if (itemsPerPage) this.itemsPerPage = itemsPerPage;
	defineProperties(this, {
		_fullItems: d(user.visitedBusinessProcesses[roleName]),
		_statusViews: d(db.views.pendingBusinessProcesses[roleName]),
		_statusMap: d(statusMap),
		_getItemOrderIndex: d(getOrderIndex),
		_getSearchFilter: d(searchFilter),
		_queryExternal: d(getViewData)
	});
};

BusinessProcessesManager.prototype = Object.create(ListManager.prototype, {
	constructor: d(BusinessProcessesManager),
	_type: d(BusinessProcess),

	// Characterics that needs to be provided per system/user:
	_fullItems: d(null),
	_statusViews: d(null),
	_statusMap: d(null),
	_getItemOrderIndex: d(null),
	_getSearchFilter: d(null),

	_isExternalQuery: d(function (query) {
		// When we have all the items, we don't need to query server
		if (this._statusViews[query.status || 'all'].totalSize <= this.itemsPerPage) return false;
		// If it's not about first page, it's only server that knows
		if (query.page > 1) return true;
		// If it's purely a first page of a status, we know
		return this._modifiers.some(function (mod) {
			return (mod.name !== 'status') && query[mod.name];
		});
	}),
	_isItemApplicable: d(function (item, query) {
		if (!this._statusMap[query.status || 'all'].data.has(item)) return false;
		if (!query.search) return true;
		return this._getSearchFilter(query.search)(item);
	}),
	// Modifiers (used only in case of non-external list resolution)
	_modifiers: d([
		{
			name: 'status',
			required: true,
			process: function (ignore, query) {
				var view = this._statusViews[query.status || 'all']
				  , list = this._resolveList({ view: view.get(1), size: view.totalSize }, query);
				return {
					list: list,
					size: (view.totalSize < this.itemsPerPage) ? list.length : view.totalSize
				};
			}
		},
		{
			name: 'search',
			process: function (data, query) {
				var value = query.search.split(/\s+/), list, result, indexMap;
				if (value.length === 1) {
					result = data.list.filter(this._getSearchFilter(value[0]));
				} else {
					result = [];
					list = data.list;
					indexMap = {};
					list.forEach(function (item, index) { indexMap[item.__id__] = index; });
					value.forEach(function (value) {
						push.apply(result, list.filter(this._getSearchFilter(value)));
					}, this);
					result = uniq.call(result).sort(function (a, b) {
						return indexMap[a.__id__] - indexMap[b.__id__];
					});
				}
				return { list: result, size: result.length };
			}
		}
	]),
	_resolveList: d(resolveList)
});
