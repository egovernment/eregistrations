// Business process dedicated search query handler
// (used to handle business processes table in official roles)

'use strict';

var uniq              = require('es5-ext/array/#/uniq')
  , customError       = require('es5-ext/error/custom')
  , isNaturalNumber   = require('es5-ext/number/is-natural')
  , findKey           = require('es5-ext/object/find-key')
  , appLocation       = require('mano/lib/client/location')
  , setupQueryHandler = require('../../../utils/setup-client-query-handler')

  , wsRe = /\s{2,}/g
  , ceil = Math.ceil, stringify = JSON.stringify;

module.exports = exports = function (listManager/*, pathname*/) {
	var queryHandler = setupQueryHandler(exports.conf, appLocation, arguments[1] || '/')
	  , statusMap = listManager._statusMap;
	queryHandler._statusMap = statusMap;
	queryHandler._statusViews = listManager._statusViews;
	queryHandler._statusMapDefaultKey = findKey(statusMap, function (data) { return data.default; });
	queryHandler._itemsPerPage = listManager.itemsPerPage;
	queryHandler._listManager = listManager;
	queryHandler.on('query', function (query) { listManager.update(query); });
	return queryHandler;
};
exports.conf = [
	{
		name: 'status',
		ensure: function (value) {
			if (!value) return this._statusMapDefaultKey;
			if (!this._statusMap[value]) throw new Error("Unreconized status value " + stringify(value));
			return (value === 'all') ? null : value;
		}
	}, {
		name: 'time'
	},
	{
		name: 'search',
		ensure: function (value) {
			var expected;
			if (!value) return;
			expected = value.toLowerCase().replace(wsRe, ' ');
			if (value !== expected) {
				throw customError("Non normative search value", { fixedQueryValue: expected });
			}
			expected = uniq.call(expected.split(/\s/)).join(' ');
			if (value !== expected) {
				throw customError("Non normative search value", { fixedQueryValue: expected });
			}
			return value;
		}
	},
	{
		name: 'page',
		ensure: function (value, query) {
			var num, pageCount;
			if (value == null) return '1';
			if (isNaN(value)) throw new Error("Unrecognized page value " + stringify(value));
			num = Number(value);
			if (!isNaturalNumber(num)) throw new Error("Unreconized page value " + stringify(value));
			if (num <= 1) throw new Error("Unexpected page value " + stringify(value));
			pageCount = ceil(this._statusViews[query.status || 'all'].totalSize / this._itemsPerPage);
			if (num > pageCount) throw new Error("Page value overflow");
			return value;
		}
	}
];
