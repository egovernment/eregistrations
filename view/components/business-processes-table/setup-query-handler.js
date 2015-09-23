// Business process dedicated search query handler
// (used to handle business processes table in official roles)

'use strict';

var isNaturalNumber   = require('es5-ext/number/is-natural')
  , findKey           = require('es5-ext/object/find-key')
  , appLocation       = require('mano/lib/client/location')
  , setupQueryHandler = require('../../../utils/setup-client-query-handler')

  , stringify = JSON.stringify;

module.exports = exports = function (statusMap, listManager) {
	var queryHandler = setupQueryHandler(exports.conf, appLocation, '/');
	queryHandler._statusMap = statusMap;
	queryHandler._statusMapDefaultKey = findKey(statusMap, function (data) { return data.default; });
	queryHandler._listManager = listManager;
	queryHandler.on('query', function (query) { listManager.update(query); });
};
exports.conf = [
	{
		name: 'status',
		ensure: function (value) {
			if (!value) return this._statusMapDefaultKey;
			if (!this._statusMap[value]) throw new Error("Unreconized status value " + stringify(value));
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
			if (num <= 1) throw new Error("Unexpected page value " + stringify(value));
			if (num > this._listManager.pageCount) throw new Error("Page value overflow");
			return value;
		}
	}
];
