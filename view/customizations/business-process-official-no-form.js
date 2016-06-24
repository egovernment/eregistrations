'use strict';

var _ = require('mano').i18n.bind('View: Official');

module.exports = exports = require('../business-process-official');

exports._processingTabLink = Function.prototype;

exports._documentsTabLink = function () {
	return a({ class: 'section-tab-nav-tab',
		id: 'tab-business-process-documents',
		href: '/' + this.businessProcess.__id__ + '/' },
		_("Documents"));
};
