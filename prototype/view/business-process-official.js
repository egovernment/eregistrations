'use strict';

module.exports = exports = require('../../view/business-process-official');

exports['submitted-menu'] = function () {
	li({ class: 'submitted-menu-item-active' }, a("Official"));
};
