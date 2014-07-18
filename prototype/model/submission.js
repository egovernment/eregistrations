// Submission abstraction

'use strict';

var db           = require('mano').db
  , File         = require('./file')
  , RejectReason = require('./reject-reason');

module.exports = db.Object.extend('DocumentSubmission', {
	files: { type: File, multiple: true, unique: true, reverse: 'submission' },
	approved: { type: db.Boolean, required: true, trueLabel: "Validate document",
		falseLabel: "Reject document" },
	matchesOriginal: { type: db.Boolean, required: true },
	rejectReasonType: { type: RejectReason, required: true,
		label: "Reject document" },
	rejectReasonMemo: { type: db.String, required: true, label: "Reason" },
	rejectReason: { type: db.String, label: "Reject document", required: true,
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
	uniqueKey: { value: function () { return this.key; } }
}, {
	validateWithOriginal: { type: db.Boolean, required: true, value: false }
});
