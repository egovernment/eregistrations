'use strict';

var _        = require('mano').i18n.bind('View: Component: Sent back info')
  , identity = require('es5-ext/function/identity')

  , _d       = _;

module.exports = exports = function (context) {
	var businessProcess = context.businessProcess
	  , revisions = businessProcess.processingSteps.revisions;
	return [h3(_("Remark")),
		p(_("We have made following comments to your application:")),
		ul(_if(revisions.filterByKey('isSentBack', true)._size, [
			_if(businessProcess.requirementUploads.recentlyRejected._size,
				li(h4(_("Issues with uploaded documents:")), div({ class: 'free-form' },
					ul(businessProcess.requirementUploads.recentlyRejected, function (requirementUpload) {
						return [h4(_d(requirementUpload.document.label,
							requirementUpload.document.getTranslations())),
							_if(eq(requirementUpload.rejectReasons._size, 1),
								p(requirementUpload.rejectReasons._first),
								ul(requirementUpload.rejectReasons, identity))];
					})))),
			_if(businessProcess.paymentReceiptUploads.recentlyRejected._size,
				li(h4(_("Issues with uploaded payment receipts:")), div({ class: 'free-form' },
					ul(businessProcess.paymentReceiptUploads.recentlyRejected, function (paymentUpload) {
						return [h4(paymentUpload.document.label),
							p(paymentUpload._rejectReasonMemo)];
					}))))
		]), _if(eq(businessProcess.dataForms._status, 'rejected'), li(
			h4(_("Issues with data forms:")),
			p(businessProcess.dataForms._rejectReason)
		)), exports._otherInfo.calll(context)),
		p(mdi(_("After all issues are cleared, please [re-submit](/submission/#submit-form) " +
			"application")))];
};

exports._otherInfo = Function.prototype;
