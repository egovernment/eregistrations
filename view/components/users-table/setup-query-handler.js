// Business process dedicated search query handler
// (used to handle business processes table in official roles)

'use strict';

var isNaturalNumber   = require('es5-ext/number/is-natural')
  , appLocation       = require('mano/lib/client/location')
  , setupQueryHandler = require('../../../utils/setup-client-query-handler')
  , wsRe              = /\s{2,}/g
	, uniq              = require('es5-ext/array/#/uniq')
  , ceil = Math.ceil, stringify = JSON.stringify;

module.exports = exports = function (listManager/*, pathname*/) {
	var queryHandler = setupQueryHandler(exports.conf, appLocation, arguments[1] || '/');
	queryHandler._view = listManager._view;
	queryHandler._listManager = listManager;
	queryHandler._itemsPerPage = listManager.itemsPerPage;
	queryHandler.on('query', function (query) { listManager.update(query); });
	return queryHandler;
};
exports.conf = [
	{
		name: 'page',
		ensure: function (value) {
			var num, pageCount;
			if (value == null) return '1';
			if (isNaN(value)) throw new Error("Unrecognized page value " + stringify(value));
			num = Number(value);
			if (!isNaturalNumber(num)) throw new Error("Unreconized page value " + stringify(value));
			if (num <= 1) throw new Error("Unexpected page value " + stringify(value));
			pageCount = ceil(this._view.totalSize / this._itemsPerPage);
			if (num > pageCount) throw new Error("Page value overflow");
			return value;
		}
	}, {
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
	}
];
