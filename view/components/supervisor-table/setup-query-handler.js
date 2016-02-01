// Supervisor dedicated search query handler
// (used to handle processing steps table in supervisor role)

'use strict';

var uniq              = require('es5-ext/array/#/uniq')
  , customError       = require('es5-ext/error/custom')
  , isNaturalNumber   = require('es5-ext/number/is-natural')
  , appLocation       = require('mano/lib/client/location')
  , setupQueryHandler = require('../../../utils/setup-client-query-handler')
  , timeRanges        = require('../../../utils/supervisor-time-ranges')
  , db                = require('mano').db

  , wsRe = /\s{2,}/g
  , ceil = Math.ceil, stringify = JSON.stringify;

module.exports = exports = function (listManager/*, pathname*/) {
	var queryHandler = setupQueryHandler(exports.conf, appLocation, arguments[1] || '/');
	queryHandler._stepsMap = listManager._stepsMap;
	queryHandler._itemsPerPage = listManager.itemsPerPage;
	queryHandler._listManager = listManager;
	queryHandler.on('query', function (query) { listManager.update(query); });
	return queryHandler;
};
exports.conf = [
	{
		name: 'step',
		ensure: function (value) {
			if (!value) return;
			if (!this._stepsMap[value]) throw new Error("Unrecognized step value " + stringify(value));
			return value;
		}
	}, {
		name: 'time',
		ensure: function (value) {
			var result;
			if (!value) return;
			result = timeRanges.some(function (item) {
				if (item.name === value) {
					return true;
				}
			});
			if (!result) throw new Error("Unrecognized time value " + stringify(value));
			return value;
		}
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
			var num, pageCount, totalSize;
			if (value == null) return '1';
			if (isNaN(value)) throw new Error("Unrecognized page value " + stringify(value));
			num = Number(value);
			if (!isNaturalNumber(num)) throw new Error("Unreconized page value " + stringify(value));
			if (num <= 1) throw new Error("Unexpected page value " + stringify(value));
			totalSize = query.step ? db.views.pendingBusinessProcesses[query.step].totalSize :
					db.views.supervisor.all.totalSize;
			pageCount = ceil(totalSize / this._itemsPerPage);
			if (num > pageCount) throw new Error("Page value overflow");
			return value;
		}
	}
];
