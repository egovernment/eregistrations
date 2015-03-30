'use strict';

var memoize              = require('memoizee/plain')
  , validDb              = require('dbjs/valid-dbjs')
  , defineRejectReason   = require('../reject-reason')
  , defineDocument       = require('../document')
  , _                    = require('mano').i18n.bind('Model: Submissions');

module.exports = memoize(function (db) {
	var RejectReason, Document;
	validDb(db);
	RejectReason   = defineRejectReason(db);
	Document       = defineDocument(db);
	db.Object.extend('Submission', {
		document: { type: Document, nested: true },
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
		validateWithOriginal: { type: db.Boolean, required: true, value: false }
	});

	db.Submission.prototype.document.label = function (_observe) {
		var requirement = this.master.requirements[this.key];
		if (requirement && requirement.label) return _observe(requirement._label);
		return this.constructor.label;
	};

	db.Submission.prototype.document.legend = function (_observe) {
		var requirement = this.master.requirements[this.key];
		if (requirement && requirement.legend) return _observe(requirement._legend);
		return this.constructor.label;
	};

	return db.Submission;
}, { normalizer: require('memoizee/normalizers/get-1')() });
