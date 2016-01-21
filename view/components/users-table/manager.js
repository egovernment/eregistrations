// Business process dedicated list manager
// (used to handle business processes table in official roles)

'use strict';

var toNaturalNumber = require('es5-ext/number/to-pos-integer')
  , toArray         = require('es5-ext/object/to-array')
  , ensureCallable  = require('es5-ext/object/valid-callable')
  , d               = require('d')
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
	  , itemsPerPage = toNaturalNumber(conf.itemsPerPage);

	if (itemsPerPage) this.itemsPerPage = itemsPerPage;
	defineProperties(this, {
		_type: d(db.User),
		_view: d(db.views.usersAdmin),
		_getItemOrderIndex: d(getOrderIndex),
		_queryExternal: d(getViewData)
	});
};

UsersManager.prototype = Object.create(ListManager.prototype, {
	constructor: d(UsersManager),
	_type: d(User),

	// Characterics that needs to be provided per system/user:
	_view: d(null),
	_getItemOrderIndex: d(null),

	_isExternalQuery: d(function (query) {
		// If it's not about first page, it's only server that knows
		return (query.page > 1);
	}),
	_modifiers: d([{
		process: function (ignore, query) {
			var list = this._resolveList({ view: this._view.get(1), size: this._view.totalSize }, query);
			return { list: list, size: this._view.totalSize };
		}
	}])
});
