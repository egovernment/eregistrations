// List of computed properties used in inspector table columns.

'use strict';

var db  = require('../../db')
  , Set = require('es6-set');

module.exports = new Set([
	'businessName',
	'certificates/applicable',
	'status',
	'submitterType'
]);

db.BusinessProcess.extensions.forEach(function (ServiceType) {
	ServiceType.prototype.certificates.map.forEach(function (certificate, key) {
		module.exports.add('certificates/map/' + key + '/status');
	});
});
