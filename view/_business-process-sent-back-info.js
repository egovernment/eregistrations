'use strict';

var identity = require('es5-ext/function/identity')
  , _        = require('mano').i18n.bind('Registration');

module.exports = exports = function (context) {
	var businessProcess = context.businessProcess
	  , revision = businessProcess.processingSteps.map.revision;
	return [h3(_("Remark")),
		p(_("We have made following comments to your application:")),
		ul(_if(revision && revision._isSentBack, [
			_if(businessProcess.requirementUploads.recentlyRejected._size,
				li(h4(_("Issues with uploaded documents:")), div({ class: 'free-form' },
					ul(businessProcess.requirementUploads.recentlyRejected, function (requirementUpload) {
						return [h4(requirementUpload.document.label),
							_if(eq(requirementUpload.rejectReasons._size, 1),
								p(requirementUpload.rejectReasons._first),
								ul(requirementUpload.rejectReasons, identity))];
					})))),
			_if(businessProcess.paymentReceiptUploads.recentlyRejected._size,
				li(h4(_("Issues with uploaded payment receipts:"), div({ class: 'free-form' },
					ul(businessProcess.paymentReceiptUploads.recentlyRejected, function (paymentUpload) {
						return [h4(paymentUpload.document.label),
							p(paymentUpload._rejectReasonMemo)];
					})))))
		]), exports._otherInfo()),
		p(mdi(_("After all issues are cleared, please [re-submit](/submission/#submit-form) " +
			"application")))];
};

exports._otherInfo = Function.prototype;
