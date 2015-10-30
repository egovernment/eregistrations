'use strict';

module.exports = exports = require('../../view/business-process-revision-document');

exports['submitted-menu'] = function () {
	li({ class: 'submitted-menu-item-active' }, a("Revsion - document"));
};
