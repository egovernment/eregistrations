'use strict';

module.exports = exports = require('../../view/user-business-process-documents');

exports['submitted-menu'] = function () {
	li({ class: 'submitted-menu-item-active' }, a("My Account"));
};
