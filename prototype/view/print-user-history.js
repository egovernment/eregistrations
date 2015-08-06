'use strict';

module.exports = require('../../view/print-request-history');

module.exports.head = function () {
	meta({ name: 'viewport', content: 'width=device-width' });
	script({ src: stUrl('prototype.legacy.js') });
	link({ href: stUrl('prototype-print.css'), rel: 'stylesheet' });
};

exports._logo = function () { return img({ src: '/img/logo-2.png' }); };
