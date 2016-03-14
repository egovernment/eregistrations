'use strict';

module.exports = function (t, a) {
	a(t('revision'), 'revision');
	a(t('revision/oni'), 'revision/steps/map/oni');
	a(t('revision/oni/foo'), 'revision/steps/map/oni/steps/map/foo');
};
