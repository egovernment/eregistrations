'use strict';

var aFrom = require('es5-ext/array/from')
  , Database = require('dbjs');

module.exports = function (t, a) {
	var db = new Database()
	  , NestedMap = t(db)
	  , map = new NestedMap()
	  , obj1 = map.map.newUniq(), obj2 = map.map.newUniq(), obj3 = map.map.newUniq();

	map.cardinalPropertyKey = 'name';
	a.deep(aFrom(map.ordered), []);
	obj3.name = 'foo';
	a.deep(aFrom(map.ordered), [obj3]);
	obj1.name = 'bar';
	a.deep(aFrom(map.ordered), [obj3, obj1]);
	obj2.set('bar', 'elo');
	a.deep(aFrom(map.ordered), [obj3, obj1]);
};
