'use strict';

module.exports = exports = require('../../view/user-business-process-documents-list');

exports['submitted-menu'] = function () {
	li(a({ class: 'submitted-menu-item-active' }, "Documents list"));
};
