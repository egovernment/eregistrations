'use strict';

module.exports = exports = require('../../view/user-submitted');

exports['submitted-menu'] = function () {
	li(a({ class: 'submitted-menu-item-active' }, "Request"));
};
