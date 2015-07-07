'use strict';

var i18nMap = require('../../i18n-scan-map.generated');

module.exports = exports = require('../../view/translations-panel');

exports['submitted-menu'] = function () {
	li(a({ href: '/i18n/' }, "Translations"));
};

exports._i18n = function () {
	return i18nMap;
};
