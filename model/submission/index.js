'use strict';

var memoize              = require('memoizee/plain')
  , defineSubmissionFile = require('./submission-file')
  , validDb              = require('dbjs/valid-dbjs')
  , defineRejectReason   = require('../reject-reason')
  , _                    = require('mano').i18n.bind('Model: Submissions');

module.exports = memoize(function (db) {
	var SubmissionFile, RejectReason;
	validDb(db);
	SubmissionFile = defineSubmissionFile(db);
	RejectReason   = defineRejectReason(db);
	db.Object.extend('Submission', {
		files: { type: db.Object, nested: true },
		approved: { type: db.Boolean, required: true, trueLabel: _("Valid"), falseLabel: _("Invalid") },
		matchesOriginal: { type: db.Boolean, required: true },
		rejectReasonType: { type: RejectReason, required: true, label: _("Reject document") },
		rejectReasonMemo: { type: db.String, required: true, label: _("Explanation") },
		rejectReason: { type: db.String, label: _("Reject document"), required: true,
			value: function () {
				var type = this.rejectReasonType;
				if (type == null) return type;
				if (type === 'other') return (this.rejectReasonMemo || null);
				return this.database.RejectReason.meta[type].label;
			}, selectField: 'rejectReasonType', otherField: 'rejectReasonMemo' },
		isApproved: { type: db.Boolean, value: function () {
			if (this.approved == null) return null;
			if (this.approved) return true;
			if (this.rejectReason == null) return null;
			return false;
		} },
		label: { value: function () {
			return this.constructor.Document.label;
		} },
		legend: { value: function () {
			return this.constructor.Document.legend;
		} },
		uniqueKey: { value: function () { return this.key; } }
	}, {
		Document: { type: db.Base }, //it's actually type: Type...but can't be defined like that now
		validateWithOriginal: { type: db.Boolean, required: true, value: false }
	});

	db.Submission.prototype.files._descriptorPrototype_.type   = SubmissionFile;
	db.Submission.prototype.files._descriptorPrototype_.nested = true;

	return db.Submission;
}, { normalizer: require('memoizee/normalizers/get-1')() });
