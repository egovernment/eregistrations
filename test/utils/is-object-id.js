'use strict';

module.exports = function (t, a) {
	a(t('elo'), true);
	a(t('0elo'), true);
	a(t('M0elo'), false);
	a(t('0e-lo'), false);
	a(t('mMM'), true);
	a(t('11231MsfwefD21'), true);
	a(t('0elo_'), false);
	a(t('0elo '), false);
};
