'use strict';

var endsWith    = require('es5-ext/string/#/ends-with')
  , _           = require('mano').i18n.bind("Document status log")
  , isPastEvent = require('../../utils/is-past-record-event')

  , nextTick = process.nextTick;

var isStatusKeyPath = RegExp.prototype.test
	.bind(/(?:requirementUploads|paymentReceiptUploads)\/map\/[a-zA-Z0-9]+\/status$/);

module.exports = function (db) {
	db.objects.on('update', function (event) {
		var id = event.object.__valueId__, bp, upload;
		if (isPastEvent(event)) return;
		if (endsWith.call(id, 'submissionForms/isAffidavitSigned')) {
			bp = event.object.master;
			nextTick(function () {
				if (!bp.requirementUploads || !bp.paymentReceiptUploads) return;

				++db._postponed_;
				bp.requirementUploads.applicable.forEach(function (ru) {
					if (ru.status) return;
					ru.document.statusLog.map.newUniq().setProperties({
						label: _("Submission"),
						time: new Date(),
						text: _("Uploaded document submitted with application for review")
					});
				});
				bp.paymentReceiptUploads.applicable.forEach(function (pr) {
					if (pr.status) return;
					pr.document.statusLog.map.newUniq().setProperties({
						label: _("Submission"),
						time: new Date(),
						text: _("Uploaded payment receipt submitted with application for review")
					});
				});
				--db._postponed_;
			});
		}
		if (event.value && isStatusKeyPath(id)) {
			upload = event.object.object;
			nextTick(function () {
				var status           = upload.status
				  , isPaymentReceipt = upload.owner.owner.key === 'paymentReceiptUploads'
				  , statusLogProperties = { time: new Date() };

				if (status === 'valid') {
					statusLogProperties.label = _("Approved");
					statusLogProperties.text = isPaymentReceipt ? _("Payment confirmed")
						: _("Uploaded files approved as valid");
				} else if (status === 'invalid') {
					statusLogProperties.label = _("Rejected");

					if (isPaymentReceipt) {
						statusLogProperties.text = _("Uploaded payment receipt marked as invalid") +
							':\n\n' + upload.rejectReasonMemo;
					} else {
						statusLogProperties.text = _("Uploaded files marked as invalid") + ':';

						if (upload.rejectReasons.size === 1) {
							statusLogProperties.text += '\n\n' + upload.rejectReasons.first;
						} else {
							upload.rejectReasons.forEach(function (rejectReason) {
								statusLogProperties.text += '\n\n' + '* ' + rejectReason;
							});
						}
					}
				}

				upload.document.statusLog.map.newUniq().setProperties(statusLogProperties);
			});
		}
	});
};
