'use strict';

var aFrom = require('es5-ext/array/from')
  , Database = require('dbjs');

module.exports = function (t, a) {
	var db = new Database()
	  , NestedMap = t(db)
	  , map = new NestedMap()
	  , obj1 = map.map.newUniq(), obj2 = map.map.newUniq(), obj3 = map.map.newUniq(), obj4, FooType;

	map.cardinalPropertyKey = 'name';
	a.deep(aFrom(map.ordered), []);
	obj3.name = 'foo';
	a.deep(aFrom(map.ordered), [obj3]);
	obj1.name = 'bar';
	a.deep(aFrom(map.ordered), [obj3, obj1]);
	obj2.set('bar', 'elo');
	a.deep(aFrom(map.ordered), [obj3, obj1]);
	a(typeof db.Object.prototype.defineNestedMap, 'function');
	obj4 = new db.Object();
	FooType = db.Object.extend('Foo');
	obj4.defineNestedMap('foo', { ItemType: FooType, cardinalPropertyKey: 'bar' });
	obj4.foo.map.define('mapItem1', { type: FooType });
	a(obj4.foo.ordered.size, 0);
	obj4.foo.map.mapItem1.bar = 'properName';
	a(obj4.foo.ordered.size, 1);
	a(obj4.foo.ordered.first.constructor, FooType);
	obj4.foo.map.define('mapItem2', { type: FooType });
	obj4.foo.map.mapItem2.bar = 'otherProperName';
	a(obj4.foo.ordered.last, obj4.foo.map.mapItem2);
};
