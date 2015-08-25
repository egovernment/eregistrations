'use strict';

module.exports = exports = require('../../view/my-account-index');

exports['submitted-menu'] = function () {
	li(a({ class: 'submitted-menu-item-active' }, "My account"));
};
