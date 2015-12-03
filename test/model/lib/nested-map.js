'use strict';

var aFrom = require('es5-ext/array/from')
  , Database = require('dbjs');

module.exports = function (t, a) {
	var db = new Database()
	  , NestedMap = t(db)
	  , map = new NestedMap()
	  , obj1 = map.map.newUniq(), obj2 = map.map.newUniq(), obj3 = map.map.newUniq(), obj4, obj5
	  , FooType, BarType;

	map.cardinalPropertyKey = 'name';
	a.deep(aFrom(map.ordered), []);
	obj3.set('name', 'foo');
	a.deep(aFrom(map.ordered), [obj3]);
	obj1.set('name', 'bar');
	a.deep(aFrom(map.ordered), [obj3, obj1]);
	obj2.set('bar', 'elo');
	a.deep(aFrom(map.ordered), [obj3, obj1]);
	a(typeof db.Object.prototype.defineNestedMap, 'function');
	obj4 = new db.Object();
	FooType = db.Object.extend('Foo');
	obj4.defineNestedMap('foo', { itemType: FooType, cardinalPropertyKey: 'bar' });
	obj4.foo.map.get('mapItem1');
	a(obj4.foo.ordered.size, 0);
	obj4.foo.map.mapItem1.bar = 'properName';
	a(obj4.foo.ordered.size, 1);
	a(obj4.foo.ordered.first.constructor, FooType);
	obj4.foo.map.get('mapItem2');
	obj4.foo.map.mapItem2.bar = 'otherProperName';
	a(obj4.foo.ordered.last, obj4.foo.map.mapItem2);
	obj5 = new db.Object();
	BarType = db.Object.extend('Bar');
	obj5.defineNestedMap('bar2', { itemType: BarType, cardinalPropertyKey: 'foo' });
	obj5.bar2.map.get('mapItem1');
	a(obj4.foo.map.getDescriptor('mapItem1').type, FooType);
};
