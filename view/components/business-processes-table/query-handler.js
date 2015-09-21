// Business process dedicated search query handler
// (used to handle business processes table in official roles)

'use strict';

var isNaturalNumber = require('es5-ext/number/is-natural')
  , findKey         = require('es5-ext/object/find-key')
  , d               = require('d')
  , appLocation     = require('mano/lib/client/location')
  , QueryHandler    = require('../objects-table/query-handler')

  , create = Object.create, stringify = JSON.stringify;

var BusinessProcessTableQueryHandler = Object.defineProperties(function (statusMap, listManager) {
	QueryHandler.call(this, this.constructor._handlersConf, appLocation, '/');
	this._queryHandler._statusMap = statusMap;
	this._queryHandler._statusMapDefaultKey =
		findKey(statusMap, function (data) { return data.default; });
	this._queryHandler._listManager = listManager;
	this.on('query', function (query) { listManager.update(query); });
}, {
	_handlersConf: d([
		{
			name: 'status',
			ensure: function (value) {
				if (!value) return this._statusMapDefaultKey;
				if (!this._statusMap[value]) {
					throw new Error("Unreconized status value " + stringify(value));
				}
				return (value === 'all') ? null : value;
			}
		},
		{ name: 'search' },
		{
			name: 'page',
			ensure: function (value) {
				var num;
				if (value == null) return '1';
				if (isNaN(value)) throw new Error("Unrecognized page value " + stringify(value));
				num = Number(value);
				if (!isNaturalNumber(num)) throw new Error("Unreconized page value " + stringify(value));
				if (num === 1) throw new Error("Unexpected default page value");
				if (num > this._listManager.pageCount) throw new Error("Page value overflow");
				return value;
			}
		}
	])
});
module.exports = BusinessProcessTableQueryHandler;

BusinessProcessTableQueryHandler.prototype = create(QueryHandler.prototype, {
	constructor: d(BusinessProcessTableQueryHandler)
});
