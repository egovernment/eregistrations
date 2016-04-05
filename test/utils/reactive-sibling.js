'use strict';

var ObservableSet = require('observable-set');

module.exports = function (t, a) {
	var set = new ObservableSet(['foo', 'bar', 3, 12, 'elo'])
	  , next = t.next(set, 3)
	  , previous = t.previous(set, 3);

	a(next.value, 12);
	a(previous.value, 'bar');

	set.delete(12);
	a(next.value, 'elo');
	a(previous.value, 'bar');

	set.delete('bar');
	a(next.value, 'elo');
	a(previous.value, 'foo');

	set.delete(3);
	a(next.value, null);
	a(previous.value, null);

	set.add(3);
	a(next.value, null);
	a(previous.value, 'elo');

	set.clear();
	a(next.value, null);
	a(previous.value, null);

	set.add(3);
	a(next.value, null);
	a(previous.value, null);

	set.add('miszka');
	a(next.value, 'miszka');
	a(previous.value, null);
};
