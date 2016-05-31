'use strict';

module.exports = exports = require('../../view/manager');

exports['submitted-menu'] = function () {
	li({ class: 'submitted-menu-item-active' }, a("Notary"));
};
