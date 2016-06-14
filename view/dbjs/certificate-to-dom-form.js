'use strict';

var db               = require('../../db')
  , d                = require('d')
  , normalizeOptions = require('es5-ext/object/normalize-options');

require('./form-section-to-dom');

module.exports = function (BusinessProcess) {
	return BusinessProcess.prototype.certificates.map.forEach(function (certificate) {
		certificate.dataForm.disablePartialSubmit = true;

		Object.defineProperty(certificate.dataForm, 'toDOMForm', d(function (document/*, options*/) {
			var options = normalizeOptions(arguments[1], {
				headerRank: 3,
				cssSectionClass: 'section-primary-sub'
			});

			if (certificate.dataForm instanceof db.FormSectionGroup) {
				return db.FormSectionGroup.prototype.toDOMForm.call(this, document, options);
			}

			return db.FormSection.prototype.toDOMForm.call(this, document, options);
		}));
	});
};
