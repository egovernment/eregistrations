'use strict';

module.exports = exports = require('../../view/document');

exports['submitted-menu'] = function () {
	li(a({ class: 'submitted-menu-item-active' }, "Request"));
};

exports._documentSide = function () {
	return a({ class: 'button-main' }, "Download document");
};
