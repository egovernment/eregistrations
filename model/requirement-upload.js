// RequirementUpload class

'use strict';

var Map                   = require('es6-map')
  , memoize               = require('memoizee/plain')
  , defineStringLine      = require('dbjs-ext/string/string-line')
  , defineCreateEnum      = require('dbjs-ext/create-enum')
  , _                     = require('mano').i18n.bind('Model')
  , definePercentage      = require('dbjs-ext/number/percentage')
  , defineDocument        = require('./document')
  , defineUser            = require('./user/base');

module.exports = memoize(function (db) {
	var StringLine        = defineStringLine(db)
	  , Percentage        = definePercentage(db)
	  , Document          = defineDocument(db)
	  , User              = defineUser(db)

	  , RequirementUpload = db.Object.extend('RequirementUpload');

	defineCreateEnum(db);

	// Enum for document upload status
	var RequirementUploadStatus = StringLine.createEnum('RequirementUploadStatus', new Map([
		['valid', { label: _("Valid") }],
		['invalid', { label: _("Invalid"), htmlClass: 'error' }]
	]));

	// Enum for document upload reject reasn
	var RequirementUploadRejectReason = StringLine.createEnum('RequirementUploadRejectReason',
		new Map([
			['illegible', { label: _("The document is unreadable") }],
			['invalid', { label: _("The loaded document does not match the required document") }],
			['other', { label: _("Other...") }]
		]));

	RequirementUpload.prototype.defineProperties({
		toString: { value: function (options) {
			return this.document.label;
		} },
		// Document which we upload
		document: { type: Document, nested: true },
		// Verification status of upload
		status: { type: RequirementUploadStatus },
		progress: {
			type: Percentage,
			// By default we require at least one file uploaded
			value: function (_observe) {
				// Handle sent back state
				if (_observe(this.master._isSentBack)) {
					return (!this.isRejected && _observe(this.document.files.ordered._size)) ? 1 : 0;
				}

				return _observe(this.document.files.ordered._size) ? 1 : 0;
			}
		},
		revisionProgress: {
			type: Percentage,
			value: function () {
				if (this.isApproved) return 1;
				return this.isRejected ? 1 : 0;
			}
		},

		// Eventual rejection details
		rejectReasonTypes: { type: RequirementUploadRejectReason, multiple: true, required: true },
		rejectReasonMemo: { type: db.String, required: true, label: _("Explanation"),
			inputPlaceholder: _("Please write here the other(s) reason(s) of rejection") },
		rejectReasons: { type: db.String, multiple: true, required: true,
			value: function () {
				var result = [], isInvalid = false;
				if (!this.rejectReasonTypes.size) return result;
				this.rejectReasonTypes.forEach(function (type) {
					if (type === 'other') {
						if (!this.rejectReasonMemo) {
							isInvalid = true;
							return;
						}
						result.push(this.rejectReasonMemo);
						return;
					}
					result.push(this.database.RequirementUploadRejectReason.meta[type].label);
				}, this);
				if (isInvalid) return [];
				return result;
			}, selectField: 'rejectReasonType', otherField: 'rejectReasonMemo' },

		// Whether document upload was rejected and reject reason was provided
		isRejected: { type: db.Boolean, value: function () {
			if (this.status == null) return false;
			if (this.status !== 'invalid') return false;
			return Boolean(this.rejectReasons.size);
		} },

		// Whether document upload was rejected recently
		// Needed for part A, where status for document might already have been cleared
		// due to changes made to uploads, but we still need to show rejection info
		isRecentlyRejected: { type: db.Boolean, value: function () {
			if ((this.status !== 'invalid') && (this.status != null)) return false;
			return Boolean(this.rejectReasons.size);
		} },

		// Whether document upload was validated and all required properties
		// where provided
		isApproved: { type: db.Boolean, value: function () { return this.status === 'valid'; } },

		// Whether uploaded documents should be verified at front-desk at certificates reception
		isFrontDeskApplicable: { type: db.Boolean, value: true },

		// Whether uploaded files were validated by front-desk processing step
		isFrontDeskApproved: { type: db.Boolean, required: true },

		relatedDataFormSections: {
			type: StringLine,
			multiple: true
		},

		toWebServiceJSON: {
			value: function (ignore) {
				return this.document.toWebServiceJSON();
			}
		},
		toJSON: { value: function (ignore) {
			var data = {
				uniqueKey: this.document.uniqueKey,
				label: this.database.resolveTemplate(this.document.label, this.document.getTranslations(),
					{ partial: true }),
				issuedBy: this.document.getOwnDescriptor('issuedBy').valueToJSON(),
				issueDate: this.document.getOwnDescriptor('issueDate').valueToJSON(),
				uploadedBy: this.uploadedBy && this.getOwnDescriptor('uploadedBy').valueToJSON()
			};
			var files = [];
			this.document.files.ordered.forEach(function (file) { files.push(file.toJSON()); });
			if (files.length) data.files = files;
			return data;
		} },
		// Enrich snapshot JSON with reactive configuration of revision related properties
		enrichJSON: { type: db.Function, value: function (data) {
			if (data.isFinalized) return data;
			data.status = this._isApproved.map(function (isApproved) {
				if (isApproved) return 'approved';
				return this._isRejected.map(function (isRejected) {
					if (isRejected) return 'rejected';
				});
			}.bind(this));
			data.isFrontDeskApproved = this._isFrontDeskApproved;
			data.statusLog = this.document.statusLog.ordered.toArray();
			data.rejectReasons = this.rejectReasons.toArray();
			return data;
		} },
		// Finalize snapshot JSON by adding revision status properties
		finalizeJSON: { type: db.Function, value: function (data) {
			var statusLog;
			if (data.isFinalized) return data;
			if (this.isApproved) data.status = 'approved';
			else if (this.isRejected) data.status = 'rejected';
			statusLog = [];
			this.document.statusLog.ordered.forEach(function (log) {
				statusLog.push(log.toJSON());
			});
			if (statusLog.length) data.statusLog = statusLog;
			if (data.status === 'rejected') {
				data.rejectReasons = this.getOwnDescriptor('rejectReasons').valueToJSON();
			}
			data.isFrontDeskApproved = this.getOwnDescriptor('isFrontDeskApproved').valueToJSON();
			data.isFinalized = true;
			return data;
		} },
		// The user who uploaded the requirementUpload
		uploadedBy: {
			type: User
		}
	});

	return RequirementUpload;
}, { normalizer: require('memoizee/normalizers/get-1')() });
