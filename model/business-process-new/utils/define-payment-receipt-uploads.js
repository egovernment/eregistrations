// Defines payment receipt uploads on business process certificates map

'use strict';

var forEach                     = require('es5-ext/object/for-each')
  , ensureObject                = require('es5-ext/object/valid-object')
  , ensureType                  = require('dbjs/valid-dbjs-type')
  , definePaymentReceiptUploads = require('../payment-receipt-uploads')

  , create = Object.create, keys = Object.keys;

module.exports = function (BusinessProcess, data) {
	var db = ensureType(BusinessProcess).database, definitions = create(null);
	definePaymentReceiptUploads(db);
	keys(ensureObject(data)).forEach(function (name) { definitions[name] = { nested: true }; });
	BusinessProcess.prototype.paymentReceiptUploads.map.defineProperties(definitions);
	forEach(data, function (props, name) { this[name].document.setProperties(props); },
		BusinessProcess.prototype.paymentReceiptUploads.map);
	return BusinessProcess;
};
