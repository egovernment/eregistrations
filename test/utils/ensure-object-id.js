'use strict';

module.exports = function (t, a) {
	a(t('elo'), 'elo');
	a(t('0elo'), '0elo');
	a.throws(function () { t(); }, TypeError);
	a.throws(function () { t(null); }, TypeError);
	a.throws(function () { t('M0elo'); }, TypeError);
	a.throws(function () { t('0e-lo'); }, TypeError);
	a(t('mMM'), 'mMM');
	a(t('11231MsfwefD21'), '11231MsfwefD21');
	a.throws(function () { t('0elo_'); }, TypeError);
	a.throws(function () { t('0elo '); }, TypeError);
};
