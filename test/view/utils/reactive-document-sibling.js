'use strict';

var ObservableSet = require('observable-set');

module.exports = function (t, a) {
	var foo = { uniqueKey: 'foo' }, bar = { uniqueKey: 'bar' }, three = { uniqueKey: 3 }
	  , twelve = { uniqueKey: 12 }, elo = { uniqueKey: 'elo' }, miszka = { uniqueKey: 'miszka' }
	  , set = new ObservableSet([foo, bar, three, twelve, elo])
	  , next = t.next(set, 3)
	  , previous = t.previous(set, 3);

	a(next.value, twelve);
	a(previous.value, bar);

	set.delete(twelve);
	a(next.value, elo);
	a(previous.value, bar);

	set.delete(bar);
	a(next.value, elo);
	a(previous.value, foo);

	set.delete(three);
	a(next.value, null);
	a(previous.value, null);

	set.add(three);
	a(next.value, null);
	a(previous.value, elo);

	set.clear();
	a(next.value, null);
	a(previous.value, null);

	set.add(three);
	a(next.value, null);
	a(previous.value, null);

	set.add(miszka);
	a(next.value, miszka);
	a(previous.value, null);
};
