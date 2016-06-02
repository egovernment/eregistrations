'use strict';

module.exports = function (t, a) {
	a(t('foo'), false);
	a(t('user'), true);
	a(t('users-admin'), false);
	a(t('manager'), true);
	a(t('manager-validation'), false);
	a(t('manager-registration'), true);
	a(t('business-process-submitted'), true);
	a(t('business-process-foo'), true);
	a(t('business-elos'), false);
};
