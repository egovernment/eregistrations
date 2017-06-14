'use strict';

var memoize          = require('memoizee/plain')
  , defineStringLine = require('dbjs-ext/string/string-line')
  , _                = require('mano').i18n;

module.exports = memoize(function (db) {
	var StringLine = defineStringLine(db)
	  , CertificateCategory;

	CertificateCategory = db.Object.extend('CertificateCategory', {
		label: { type: StringLine }
	});

	CertificateCategory.newNamed('businessRegistryCertificateCategory', {
		label: _("Business registry")
	});

	CertificateCategory.newNamed('taxPayersCertificateCategory', {
		label: _("Taxes payers")
	});

	CertificateCategory.newNamed('employersCertificateCategory', {
		label: _("Employers")
	});

	return CertificateCategory;
}, { normalizer: require('memoizee/normalizers/get-1')() });
