'use strict';

var ObservableValue = require('observable-value')
  , ObservableSet = require('observable-set');

module.exports = function (t, a) {
	var item = {}, collection = [];
	item.prop1 = 1;
	a(t(item)._prop1 instanceof ObservableValue, true);
	a(t(item)._prop1.value, 1);
	item.prop2 = false;
	a(t(item)._prop1.value, 1);
	a(t(item)._prop2.value, false);
	item.subItem = { prop3: true };
	a(t(item)._subItem._prop3.value, true);
	collection.push({ prop1: false });
	collection.push({ prop1: true });
	a(t({ collection: collection }).collection instanceof ObservableSet, true);
	a(t({ collection: collection }).collection.size, 2);
};
