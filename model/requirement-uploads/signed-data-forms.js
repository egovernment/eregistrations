'use strict';

var memoize  = require('memoizee/plain')
  , ensureDb = require('dbjs/valid-dbjs')
  , defineRequirementUpload       = require('../requirement-upload')
  , defineSignedDataFormsDocument = require('../documents/signed-data-forms');

module.exports = memoize(function (db) {
	var SignedDataFormsDocument, RequirementUpload;
	SignedDataFormsDocument = defineSignedDataFormsDocument(ensureDb(db));
	RequirementUpload       = defineRequirementUpload(db);

	return RequirementUpload.extend('SignedDataFormsRequirementUpload', {
		document: { type: SignedDataFormsDocument },
		progress: {
			value: function (_observe) {
				var valid = 0, total = 2;
				// Handle sent back state
				if (_observe(this.master._isSentBack) && this.isRejected) return 0;
				if (_observe(this.document._isUpToDate)) valid++;
				if (_observe(this.document.files.ordered._size)) valid++;
				return valid / total;
			}
		}
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
