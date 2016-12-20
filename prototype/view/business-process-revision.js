'use strict';

module.exports = exports = require('../../view/business-process-revision');

exports['submitted-menu'] = function () {
	li({ class: 'submitted-menu-item-active' }, a("Revision"));
};
