// Inspector dedicated list manager

'use strict';

var toNaturalNumber = require('es5-ext/number/to-pos-integer')
  , toArray         = require('es5-ext/object/to-array')
  , ensureObject    = require('es5-ext/object/valid-object')
  , ensureCallable  = require('es5-ext/object/valid-callable')
  , Set             = require('es6-set')
  , d               = require('d')
  , memoize         = require('memoizee/plain')
  , db              = require('mano').db
  , getData         = require('mano/lib/client/xhr-driver').get
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
	  , itemsPerPage  = toNaturalNumber(conf.itemsPerPage);

	if (itemsPerPage) this.itemsPerPage = itemsPerPage;

	defineProperties(this, {
		_getItemOrderIndex: d(getOrderIndex),
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
	_fullItems: d(new Set()),

	_isExternalQuery: d(function (query) { return true; }),
	_isItemApplicable: d(function (item, query) { return true; }),
	_resolveList: d(resolveList)
});
