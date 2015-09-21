// Business process dedicated list manager
// (used to handle business processes table in official roles)

'use strict';

var d               = require('d')
  , ListManager     = require('../objects-table/manager')
  , resolveList     = require('../objects-table/resolve-list')
  , BusinessProcess = require('mano').db.BusinessProcess;

var BusinessProcessesManager = module.exports = function () {};

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
		if (this._statusViews[query.status].totalSize <= 50) return false;
		// If it's not about first page, it's only server that knows
		if (query.page > 1) return true;
		// If it's purely a first page of a status, we know
		return this._modifiers.some(function (mod) {
			return (mod.name !== 'status') && query[mod.name];
		});
	}),
	_isItemApplicable: d(function (item, query) {
		if (!this._statusMap[query.status].data.has(item)) return false;
		if (!query.search) return true;
		return this._getSearchFilter(query.search)(item);
	}),
	_modifiers: d([
		{
			name: 'status',
			process: function (ignore, query) {
				var view = this._statusViews[query.status]
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
				var list = data.list.filter(this._getSearchFilter(query.search));
				console.log("SEARCH", data.list.length, list.length);
				return { list: list, size: list.length };
			}
		}
	]),
	_resolveList: d(resolveList),
	_queryExternal: d(function (query) {
		console.log("Query external", query);
	})
});
