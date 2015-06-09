// RequirementUpload class

'use strict';

var Map              = require('es6-map')
  , memoize          = require('memoizee/plain')
  , defineStringLine = require('dbjs-ext/string/string-line')
  , _                = require('mano').i18n.bind('Model: Submissions')
  , defineDocument   = require('./document');

module.exports = memoize(function (db) {
	var StringLine = defineStringLine(db)
	  , Document = defineDocument(db);

	// Enum for document upload status
	var RequirementUploadStatus = StringLine.createEnum('DocumentUploadStatus', new Map([
		['valid', {
			label: _("Valid")
		}],
		['invalid', {
			label: _("Invalid")
		}]
	]));

	// Enum for document upload reject reasn
	var RequirementUploadRejectReason = StringLine.createEnum('DocumentUploadRejectReason', new Map([
		["illegible", {
			label: _("The document is unreadable")
		}],
		["invalid", {
			label: _("The loaded document does not match the required document")
		}],
		["other", {
			label: _("Other") + "..."
		}]
	]));

	return db.Object.extend('RequirementUpload', {
		// Document which we upload
		document: { type: Document, nested: true },
		// Verification status of upload
		status: { type: RequirementUploadStatus, required: true },

		// Eventual rejection details
		rejectReasonTypes: { type: RequirementUploadRejectReason, multiple: true, required: true },
		rejectReasonMemo: { type: db.String, required: true, label: _("Explanation") },
		rejectReasons: { type: db.String, multiple: true, required: true,
			value: function () {
				var result = [], isInvalid = false;
				if (!this.rejectReasonTypes.size) return null;
				this.rejectReasonTypes.forEach(function (type) {
					if (type === 'other') {
						if (!this.rejectReasonMemo) {
							isInvalid = true;
							return;
						}
						result.push(this.rejectReasonMemo);
						return;
					}
					result.push(this.database.RejectReason.meta[type].label);
				}, this);
				if (isInvalid) return null;
				return result;
			}, selectField: 'rejectReasonType', otherField: 'rejectReasonMemo' },

		// Whether document upload was validated and all required properties
		// where provided
		// Returns null if validation is not complete, true if complete and valid,
		// false if complete and invalid
		isApproved: { type: db.Boolean, value: function () {
			if (this.status == null) return null;
			if (this.status === 'valid') {
				if (this.document.dataForm.progress !== 1) return null;
				return true;
			}
			if (this.rejectReason == null) return null;
			return false;
		} },

		// Wether uploaded documents should be verified at front-desk at certificates reception
		validateWithOriginal: { type: db.Boolean, value: true },

		// Whether uploaded files matches original document (decided at last front-desk processing step)
		matchesOriginal: { type: db.Boolean, required: true }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
