'use strict';

var identity = require('es5-ext/function/identity')
  , _        = require('mano').i18n.bind('Registration')
  , _d       = _;

module.exports = exports = function (context) {
	var businessProcess = context.businessProcess
	  , revisions = businessProcess.processingSteps.revisions;
	return [h3(_("Remark")),
		p(_("We have made following comments to your application:")),
		ul({ class: 'info-main-documents-sent-back' },
			_if(revisions.filterByKey('isSentBack', true)._size, [
				_if(businessProcess.requirementUploads.recentlyRejected._size,
					li(h4(_("Issues with uploaded documents:")), div({ class: 'free-form' },
						ul({ class: 'info-main-documents-sent-back-list' },
							businessProcess.requirementUploads.recentlyRejected, function (requirementUpload) {
								return [h4(_d(requirementUpload.document.label,
									requirementUpload.document.getTranslations())),
									_if(eq(requirementUpload.rejectReasons._size, 1),
										span(requirementUpload.rejectReasons._first),
										ul({ class: 'info-main-documents-sent-back-list-reasons' },
											requirementUpload.rejectReasons, identity))];
							})))),
				_if(businessProcess.paymentReceiptUploads.recentlyRejected._size,
					li(h4(_("Issues with uploaded payment receipts:")), div({ class: 'free-form' },
						ul({ class: 'info-main-documents-sent-back-list' },
							businessProcess.paymentReceiptUploads.recentlyRejected, function (paymentUpload) {
								return [h4(paymentUpload.document.label),
									span(paymentUpload._rejectReasonMemo)];
							}))))
			]), exports._otherInfo(context)),
		p(mdi(_("After all issues are cleared, please [re-submit](/submission/#submit-form) " +
			"application")))];
};

exports._otherInfo = Function.prototype;
