// List of computed properties used in business process table columns

'use strict';

var db  = require('../../db')
  , Set = require('es6-set');

module.exports = exports = new Set([
	'businessName',
	'certificates/applicable',
	'requirementUploads/applicable',
	'paymentReceiptUploads/applicable'
]);

db.BusinessProcess.extensions.forEach(function (ServiceType) {
	ServiceType.prototype.certificates.map.forEach(function (certificate, key) {
		exports.add('certificates/map/' + key + '/status');
	});
});
