'use strict';

var db              = require('../../../db')
  , toNaturalNumber = require('es5-ext/number/to-pos-integer')
  , toArray         = require('es5-ext/object/to-array')
  , includes        = require('es5-ext/array/#/contains')
  , getData         = require('mano/lib/client/xhr-driver').get
  , memoize         = require('memoizee/plain')
  , d               = require('d')
  , ListManager     = require('../objects-table/manager')
  , getSearchFilter = require('../../../utils/get-search-filter');

require('memoizee/ext/max-age');

var getViewData = function (query) {
	return getData('/get-business-process-view/', query).aside(function (result) {
		if (!result.data) return;
		result.data.forEach(function (eventStr) { db.unserializeEvent(eventStr, 'server-temporary'); });
	});
};

var InspectorManager = module.exports = function (conf) {
	var searchFilter = getSearchFilter
	  , itemsPerPage = toNaturalNumber(conf.itemsPerPage);

	if (itemsPerPage) this.itemsPerPage = itemsPerPage;

	Object.defineProperties(this, {
		_getSearchFilter: d(searchFilter),
		_queryExternal: d(memoize(getViewData, {
			normalizer: function (args) { return String(toArray(args[0], null, null, true)); },
			maxAge: 10 * 1000
		}))
	});
};

InspectorManager.prototype = Object.create(ListManager.prototype, {
	constructor: d(InspectorManager),
	_type: d(db.BusinessProcess),

	// Characterics that needs to be provided per system/user:
	_getSearchFilter: d(null),

	_isExternalQuery: d(function () {
		return true;
	}),
	// Modifiers (used only in case of non-external list resolution)
	_modifiers: d([{
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
