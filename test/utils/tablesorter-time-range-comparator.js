'use strict';

module.exports = function (t, a) {
	var testArr = ['1 h', '10h', '10h 1m', '1h 30m', '-', '2h 15m', '< 1', '< 1', '12m',
		'1m', '2m', '-'];
	a.deep(
		testArr.sort(t),
		['-', '-', '< 1', '< 1', '1m', '2m', '12m', '1 h', '1h 30m', '2h 15m', '10h', '10h 1m']
	);
};
