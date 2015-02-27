'use strict';

var includes      = require('es5-ext/array/#/contains')
  , ObservableSet = require('observable-set');

module.exports = function (array) {
	var set = new ObservableSet(array);
	array.on('change', function () {
		set._postponed_ += 1;
		set.forEach(function (user) {
			if (!includes.call(array, user)) set.delete(user);
		});
		array.forEach(function (user) { set.add(user); });
		set._postponed_ -= 1;
	});
	return set;
};
