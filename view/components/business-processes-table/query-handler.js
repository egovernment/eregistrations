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
	this._statusMap = statusMap;
	this._statusMapDefaultKey = findKey(statusMap, function (data) { return data.default; });
	this._listManager = listManager;
	this.on('query', function (query) { listManager.update(query); });
}, {
	_handlersConf: d([
		{
			name: 'status',
			ensure: function (value) {
				if (!this._statusMap[value]) {
					throw new Error("Unreconized status value " + stringify(value));
				}
				if (value === this._statusMapDefaultKey) {
					throw new Error("Unexpected default key status");
				}
				return value;
			},
			resolve: function (value) {
				if (value == null) return this._statusMapDefaultKey;
				return value;
			}
		},
		{ name: 'search' },
		{
			name: 'page',
			ensure: function (value) {
				if (isNaN(value)) throw new Error("Unreconized page value " + stringify(value));
				value = Number(value);
				if (!isNaturalNumber(value)) throw new Error("Unreconized page value " + stringify(value));
				if (value === 1) throw new Error("Unexpected default page value");
				if (value < this._pageCount) throw new Error("Page value overflow");
				return value;
			},
			resolve: function (value) {
				if (value == null) return 1;
				return Number(value);
			}
		}
	])
});
module.exports = BusinessProcessTableQueryHandler;

BusinessProcessTableQueryHandler.prototype = create(QueryHandler.prototype, {
	constructor: d(BusinessProcessTableQueryHandler)
});
