'use strict';

var ObservableMap = require('observable-map');

module.exports = function (t, a) {
	var someMap = new ObservableMap([['foo', 'moszka'], [true, 34], [23, false]])
	  , set = [], deleted = [];
	t(someMap, {
		onSet: function (key, value) { set.push([key, value]); },
		onDelete: function (key, value) { deleted.push([key, value]); }
	});
	someMap.delete(true);
	a.deep(set, []);
	a.deep(deleted, [[true, 34]]);
	someMap.set('elo', 342);
	a.deep(set, [['elo', 342]]);
	a.deep(deleted, [[true, 34]]);
	set = [];
	deleted = [];
	someMap.set('foo', 787);
	a.deep(set, [['foo', 787]]);
	a.deep(deleted, [['foo', 'moszka']]);
};
