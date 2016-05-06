'use strict';

module.exports = function (t, a) {
	a(t('user'), false);
	a(t('officialization'), false);
	a(t('official'), false);
	a(t('officialHippo'), true);
};
