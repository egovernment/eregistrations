'use strict';

module.exports = function (t, a) {
	a(t.has('daily'), true);
	a(t.has('weekly'), true);
	a(t.has('monthly'), true);
	a(t.has('yearly'), true);
};
