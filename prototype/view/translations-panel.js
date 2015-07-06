'use strict';

module.exports = exports = require('../../view/translations-panel');

exports['submitted-menu'] = function () {
	li(a({ href: '/i18n/' }, "Translations"));
};

exports._translationsList = function () {
	return ['Lorem ipsum dolor sit amet, consectetur adipiscing elit',
		'Lorem ipsum dolor sit amet, consectetur',
		'Lorem ipsum dolor sit amet',
		'Lorem ipsum dolor sit amet, consectetur adipiscing',
		'Lorem ipsum dolor sit amet, consectetur',
		'Lorem ipsum dolor sit amet',
		'Lorem ipsum dolor sit amet, consectetur adipiscing'];
};
