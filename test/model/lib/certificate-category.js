'use strict';

var Database = require('dbjs');

module.exports = function (t, a) {
	var db = new Database();
	t(db);

	a(db.businessRegistryCertificateCategory.__id__, 'businessRegistryCertificateCategory');
	a(db.taxPayersCertificateCategory.__id__, 'taxPayersCertificateCategory');
	a(db.employersCertificateCategory.__id__, 'employersCertificateCategory');
};
