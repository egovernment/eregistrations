'use strict';

module.exports = function (t, a) {
	a(t('-'), -2);
	a(t('< 1'), -1);
	a(t('1 m'), 60);
	a(t('12m'), 720);
	a(t('1h'), 3600);
	a(t('1h 30m'), 5400);
};
