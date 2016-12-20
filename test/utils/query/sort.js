'use strict';

var Map = require('es6-map');

module.exports = function (t, a) {
	var map = new Map([
		['a', { count: 2 }],
		['b', { count: 5 }],
		['c', { count: 1 }]
	]);

	a.deep(t(map, function (a, b) { return a.count - b.count; }),
		[map.get('c'), map.get('a'), map.get('b')]);
};
