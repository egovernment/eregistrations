// Single payment submitted view

'use strict';

var paymentView = require('./components/business-process-view-payment-receipt')
  , camelToHyphen  = require('es5-ext/string/#/camel-to-hyphen');

exports._parent = require('./business-process-submitted-documents');
exports._match = 'document';

exports._dynamic = function () {
	var listItemId = 'document-item-' + camelToHyphen.call(this.document.uniqueKey);
	var conf = {};
	conf[listItemId] = { class: { active: true } };
	return conf;
};

exports['selection-preview'] = function () {
	paymentView(this);
};
