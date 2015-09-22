'use strict';

var isNaturalNumber = require('es5-ext/number/is-natural')
  , QueryHandler    = require('../../utils/query-handler')

  , stringify = JSON.stringify;

module.exports = function (statusMap) {
	return new QueryHandler([
		{
			name: 'status',
			ensure: function (value) {
				if (!value) return;
				if (!statusMap[value]) {
					throw new Error("Unreconized status value " + stringify(value));
				}
				if (value === 'all') throw new Error("Unexpected default key status");
				return value;
			}
		},
		{ name: 'search' },
		{
			name: 'page',
			ensure: function (value) {
				var num;
				if (isNaN(value)) throw new Error("Unrecognized page value " + stringify(value));
				num = Number(value);
				if (!isNaturalNumber(num)) throw new Error("Unreconized page value " + stringify(value));
				if (!num) throw new Error("Unexpected page value " + stringify(value));
				return value;
			}
		}
	]);
};
