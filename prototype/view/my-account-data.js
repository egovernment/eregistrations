'use strict';

module.exports = exports = require('../../view/my-account-data');

exports['submitted-menu'] = function () {
	li(a({ class: 'submitted-menu-item-active' }, "My account"));
};
