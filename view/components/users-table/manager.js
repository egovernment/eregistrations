// Business process dedicated list manager
// (used to handle business processes table in official roles)

'use strict';

var includes        = require('es5-ext/array/#/contains')
  , toNaturalNumber = require('es5-ext/number/to-pos-integer')
  , toArray         = require('es5-ext/object/to-array')
  , ensureCallable  = require('es5-ext/object/valid-callable')
  , d               = require('d')
  , getSearchFilter = require('eregistrations/utils/get-search-filter')
  , memoize         = require('memoizee/plain')
  , db              = require('mano').db
  , getData         = require('mano/lib/client/xhr-driver').get
  , ListManager     = require('../objects-table/manager')

  , defineProperties = Object.defineProperties, User = db.User;

require('memoizee/ext/max-age');

var getViewData = memoize(function (query) {
	return getData('/get-users-view/', query).aside(function (result) {
		if (!result.data) return;
		result.data.forEach(function (eventStr) { db.unserializeEvent(eventStr, 'server-temporary'); });
	});
}, {
	normalizer: function (args) { return String(toArray(args[0], null, null, true)); },
	maxAge: 10 * 1000
});

var UsersManager = module.exports = function (conf) {
	var getOrderIndex = ensureCallable(conf.getOrderIndex)
	  , itemsPerPage = toNaturalNumber(conf.itemsPerPage)
	  , searchFilter = getSearchFilter;

	if (itemsPerPage) this.itemsPerPage = itemsPerPage;
	defineProperties(this, {
		_type: d(db.User),
		_view: d(conf.views || db.views.usersAdmin),
		_getItemOrderIndex: d(getOrderIndex),
		_getSearchFilter: d(searchFilter),
		_queryExternal: d(getViewData)
	});
};

UsersManager.prototype = Object.create(ListManager.prototype, {
	constructor: d(UsersManager),
	_type: d(User),

	// Characterics that needs to be provided per system/user:
	_view: d(null),
	_getItemOrderIndex: d(null),
	_getSearchFilter: d(null),

	_isExternalQuery: d(function (query) {
		if (query.search) return true;
		return (query.page > 1);
	}),
	_isItemApplicable: d(function (item, query) {
		if (!query.search) return true;
		return query.search.split(/\s+/).every(function (value) {
			return this._getSearchFilter(value)(item);
		}, this);
	}),
	_modifiers: d([{
		process: function (ignore, query) {
			var list = this._resolveList({ view: this._view.get(1), size: this._view.totalSize }, query);
			return { list: list, size: this._view.totalSize };
		}
	}, {
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
	}])
});
