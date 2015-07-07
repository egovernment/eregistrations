'use strict';

var i18nMap = require('./i18n-fake-scan-map.json');

window.i18n = {};

exports._parent = require('./meta-admin-base');

module.exports = exports = require('../../view/translations-panel');

exports['submitted-menu'] = function () {
	li(a({ href: '/i18n/' }, "Translations"));
};

exports._i18n = function () {
	return i18nMap;
};
