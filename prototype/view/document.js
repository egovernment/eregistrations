'use strict';

module.exports = exports = require('../../view/business-process-document');

exports['submitted-menu'] = function () {
	li(a({ class: 'submitted-menu-item-active' }, "Request"));
};
