// Inspector dedicated list manager

'use strict';

var includes        = require('es5-ext/array/#/contains')
  , toNaturalNumber = require('es5-ext/number/to-pos-integer')
  , toArray         = require('es5-ext/object/to-array')
  , ensureObject    = require('es5-ext/object/valid-object')
  , ensureCallable  = require('es5-ext/object/valid-callable')
  , Set             = require('es6-set')
  , d               = require('d')
  , memoize         = require('memoizee/plain')
  , db              = require('mano').db
  , getData         = require('mano/lib/client/xhr-driver').get
  , getSearchFilter = require('../../../utils/get-search-filter')
  , ListManager     = require('../objects-table/manager')
  , resolveList     = require('../objects-table/resolve-list')

  , defineProperties = Object.defineProperties, BusinessProcess = db.BusinessProcess;

require('memoizee/ext/max-age');

var getViewData = function (query) {
	return getData('/get-data/', query).aside(function (result) {
		if (!result.data) return;
		result.data.forEach(function (eventStr) { db.unserializeEvent(eventStr, 'server-temporary'); });
	});
};

var BusinessProcessesManager = module.exports = function (conf) {
	var getOrderIndex = ensureCallable(ensureObject(conf).getOrderIndex)
	  , searchFilter  = getSearchFilter
	  , itemsPerPage  = toNaturalNumber(conf.itemsPerPage);

	if (itemsPerPage) this.itemsPerPage = itemsPerPage;

	defineProperties(this, {
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
	_getItemOrderIndex: d(null),
	_getSearchFilter: d(null),
	_fullItems: d(new Set()),

	_isExternalQuery: d(function (query) { return true; }),
	_isItemApplicable: d(function (item, query) {
		if (!query.search) return true;
		return query.search.split(/\s+/).every(function (value) {
			return this._getSearchFilter(value)(item);
		}, this);
	}),
	// Modifiers (used only in case of non-external list resolution)
	_modifiers: d([
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
