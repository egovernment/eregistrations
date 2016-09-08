'use strict';

module.exports = function (t, a) {
	var mayanEndOfTheWorld = new Date(2012, 11, 21, 1, 1);

	a.deep(t(mayanEndOfTheWorld, 'America/Guatemala').valueOf(),
		new Date(2012, 11, 20, 18, 1).valueOf());
	a.deep(t(mayanEndOfTheWorld, 'Europe/Warsaw').valueOf(),
		new Date(2012, 11, 21, 1, 1).valueOf());
};
