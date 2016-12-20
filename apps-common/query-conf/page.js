'use strict';

var isNaturalNumber = require('es5-ext/number/is-natural')
  , stringify       = JSON.stringify;

module.exports = {
	name: 'page',
	ensure: function (value) {
		var num;

		if (value == null) return 1;

		if (isNaN(value)) throw new Error("Unrecognized page value " + stringify(value));
		num = Number(value);
		if (!isNaturalNumber(num)) throw new Error("Unreconized page value " + stringify(value));
		if (!num) throw new Error("Unexpected page value " + stringify(value));

		return value;
	}
};
