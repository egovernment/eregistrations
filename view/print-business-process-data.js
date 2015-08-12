// Basic business process print data view
'use strict';

var _      = require('mano').i18n.bind('User')
  , format = require('es5-ext/date/#/format');

exports._parent = require('./print-base');
exports._match = 'businessProcess';

exports['print-page-title'] = function () {
	h2(_("Bussiness process data"));
	p(format.call(new Date(), '%d/%m/%Y'));
};

exports.main = function () {
	h2(this.businessProcess._businessName);
};
