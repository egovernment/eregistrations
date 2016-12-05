// Translations Panel view.
'use strict';

module.exports = exports = require('eregistrations/view/translations-panel');

exports['translations-nav'] = { class: { 'submitted-menu-item-active': true } };

exports._i18n = function () {
	return require('../../i18n-scan-map.generated');
};
