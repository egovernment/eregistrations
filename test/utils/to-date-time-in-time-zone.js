'use strict';

module.exports = function (t, a) {
	var mayanEndOfTheWorld = new Date(Date.UTC(2012, 11, 21, 1, 1));

	a.deep(t(mayanEndOfTheWorld, 'America/Guatemala').valueOf(),
		new Date(2012, 11, 20, 19, 1).valueOf());
	a.deep(t(mayanEndOfTheWorld, 'Europe/Warsaw').valueOf(),
		new Date(2012, 11, 21, 2, 1).valueOf());

	a.deep(t(new Date(Date.UTC(2016, 9, 24, 17, 3, 30)), 'America/Guatemala').valueOf(),
		new Date(2016, 9, 24, 11, 3, 30).valueOf());
	a.deep(t(new Date(Date.UTC(2016, 9, 24, 18, 3, 30)), 'America/Guatemala').valueOf(),
		new Date(2016, 9, 24, 12, 3, 30).valueOf());
};
