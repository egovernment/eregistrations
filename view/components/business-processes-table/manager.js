// Business process dedicated list manager
// (used to handle business processes table in official roles)

'use strict';

var includes        = require('es5-ext/array/#/contains')
  , toNaturalNumber = require('es5-ext/number/to-pos-integer')
  , toArray         = require('es5-ext/object/to-array')
  , ensureObject    = require('es5-ext/object/valid-object')
  , ensureCallable  = require('es5-ext/object/valid-callable')
  , ensureString    = require('es5-ext/object/validate-stringifiable-value')
  , d               = require('d')
  , getSearchFilter = require('eregistrations/utils/get-search-filter')
  , memoize         = require('memoizee/plain')
  , db              = require('mano').db
  , getData         = require('mano/lib/client/xhr-driver').get
  , ListManager     = require('../objects-table/manager')
  , resolveList     = require('../objects-table/resolve-list')

  , defineProperties = Object.defineProperties, BusinessProcess = db.BusinessProcess;

require('memoizee/ext/max-age');

var getViewData = function (query) {
	return getData('/get-business-processes-view/', query).aside(function (result) {
		if (!result.data) return;
		result.data.forEach(function (eventStr) { db.unserializeEvent(eventStr, 'server-temporary'); });
	});
};

var BusinessProcessesManager = module.exports = function (conf) {
	var user = db.User.validate(ensureObject(conf).user)
	  , stepShortPath = ensureString(conf.roleName)
	  , viewKeyPath = conf.viewKeyPath
	  , statusMap = ensureObject(conf.statusMap)
	  , getOrderIndex = ensureCallable(conf.getOrderIndex)
	  , searchFilter = getSearchFilter
	  , itemsPerPage = toNaturalNumber(conf.itemsPerPage)
	  , pendingBusinessProcesses;

	if (itemsPerPage) this.itemsPerPage = itemsPerPage;
	if (viewKeyPath) {
		pendingBusinessProcesses = db.views.pendingBusinessProcesses.resolveSKeyPath(viewKeyPath).value;
	} else {
		pendingBusinessProcesses = db.views.pendingBusinessProcesses.getBySKeyPath(stepShortPath);
	}

	defineProperties(this, {
		_fullItems: d(user.recentlyVisited.businessProcesses
			.getBySKeyPath(conf.fullItemsRoleName || stepShortPath)),
		_canItemBeApplicable: d((conf.canItemBeApplicable != null)
			? ensureCallable(conf.canItemBeApplicable) : null),
		_statusViews: d(pendingBusinessProcesses),
		_statusMap: d(statusMap),
		_getItemOrderIndex: d(getOrderIndex),
		_getSearchFilter: d(searchFilter),
		_queryExternal: d(memoize(getViewData, {
			normalizer: function (args) { return String(toArray(args[0], null, null, true)); },
			maxAge: 10 * 1000
		}))
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
		if (this._canItemBeApplicable && !this._canItemBeApplicable(item, query)) return false;
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
	]),
	_resolveList: d(resolveList)
});
