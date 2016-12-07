'use strict';

var uniq        = require('es5-ext/array/#/uniq')
  , customError = require('es5-ext/error/custom')
  , wsRe        = /\s{2,}/g;

module.exports = {
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
};
