'use strict';

module.exports = exports = require('../../view/business-process-document');

exports['submitted-menu'] = function () {
	li({ class: 'submitted-menu-item-active' }, a("Request"));
};
