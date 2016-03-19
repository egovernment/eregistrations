'use strict';

var ensureObject   = require('es5-ext/object/valid-object')
  , ensureString   = require('es5-ext/object/validate-stringifiable-value')
  , ensureDatabase = require('dbjs/valid-dbjs')
  , basename       = require('path').basename;

module.exports = function (db) {
	ensureDatabase(db);
	return function (query) {
		var businessProcessId, documentType, businessProcess, key, target, document, fileIdx, result;
		ensureObject(query);
		businessProcessId = ensureString(query.businessProcessId);
		documentType = ensureString(query.documentType);
		key = ensureString(query.key);
		businessProcess = db.BusinessProcessBase.getById(businessProcessId);
		if (!businessProcess || !businessProcess.isSubmitted) return false;
		if (documentType === 'requirement') {
			businessProcess.requirementUploads.applicable.some(function (upload) {
				if (upload.document.uniqueKey === key) {
					document = upload.document;
					return true;
				}
			});
		} else if (documentType === 'receipt') {
			target = businessProcess.paymentReceiptUploads.map.get(key);
			if (target && !businessProcess.paymentReceiptUploads.applicable.has(target)) target = null;
			if (target) document = target.document;
		} else {
			document = businessProcess.certificates.map.get(key);
			if (document && !businessProcess.certificates.applicable.has(document)) document = null;
		}
		if (!document || (document.files.ordered <= 1)) return false;
		fileIdx = 0;
		result = {};
		document.files.ordered.forEach(function (file) {
			// Change filename from form 'file-skey-buniness-name-document-label.xxx' to
			// 'business-name-document-label-index.xxx' for ux reasons.
			var name = basename(file.path).replace(/^[\d\w]+-/, '').split('.');
			name[0] += '-' + String(++fileIdx);
			result[name.join('.')] = file.path;
		});
		return result;
	};
};
