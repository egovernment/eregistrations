'use strict';

var ObservableSet = require('observable-set');

module.exports = function (t, a) {
	var someSet = new ObservableSet(['foo', true, 23]), added = [], deleted = [];
	t(someSet, {
		onAdd: function (item) { added.push(item); },
		onDelete: function (item) { deleted.push(item); }
	});
	someSet.delete(true);
	a.deep(added, []);
	a.deep(deleted, [true]);
	someSet.add('elo');
	a.deep(added, ['elo']);
	a.deep(deleted, [true]);
};
