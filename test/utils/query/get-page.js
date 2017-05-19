'use strict';

var mano = require('mano');

if (!mano.env) mano.env = {};

module.exports = function (t, a) {
	var arr = [], i = 0;

	for (i = 1003; i > 0; --i) arr.push({ i: i });

	a.throws(function () { t(arr, -1); }, TypeError);
	a.throws(function () { t(arr, 0); }, TypeError);

	a.deep(t(arr, 1), arr);
	a.deep(t(arr, 2), []);
	a.deep(t(arr, 21), []);
	a.deep(t(arr, 22), []);
};
