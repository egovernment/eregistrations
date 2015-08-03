'use strict';

module.exports = exports = require('../../view/official');

exports['submitted-menu'] = function () {
	li(a({ class: 'submitted-menu-item-active' }, "Official"));
	li(postButton({ value: "Role" }));
};
