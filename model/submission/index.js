'use strict';

var Map              = require('es6-map')
  , memoize          = require('memoizee/plain')
  , defineStringLine = require('dbjs-ext/string/string-line')
  , _                = require('mano').i18n.bind('Model: Submissions')
  , defineDocument   = require('../document')
  , defineCost       = require('../cost');

module.exports = memoize(function (db) {
	var StringLine = defineStringLine(db)
	  , Document = defineDocument(db)
	  , Cost = defineCost(db);

	if (!db.RejectReason) {
		StringLine.createEnum('RejectReason', new Map([
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
	}

	return db.Object.extend('Submission', {
		document: { type: Document, nested: true },
		approved: { type: db.Boolean, required: true, trueLabel: _("Valid"), falseLabel: _("Invalid") },
		// If upload concerns payment receipt, this links cost it corresponds
		correspondingCost: { type: Cost },
		isFrontDeskApproved: { type: db.Boolean, required: true },
		rejectReasonType: { type: db.RejectReason, required: true, label: _("Reject document") },
		rejectReasonMemo: { type: db.String, required: true, label: _("Explanation") },
		rejectReason: { type: db.String, label: _("Reject document"), required: true,
			value: function () {
				var type = this.rejectReasonType;
				if (type == null) return type;
				if (type === 'other') return (this.rejectReasonMemo || null);
				return this.database.RejectReason.meta[type].label;
			}, selectField: 'rejectReasonType', otherField: 'rejectReasonMemo' },
		isApproved: { type: db.Boolean, value: function (_observe) {
			if (this.approved == null) return null;
			if (this.approved) {
				if (this.correspondingCost) {
					return _observe(this.correspondingCost._isPaid) || null;
				}
				return true;
			}
			if (this.rejectReason == null) return null;
			return false;
		} },
		isFrontDeskApplicable: { type: db.Boolean, required: true, value: false }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
