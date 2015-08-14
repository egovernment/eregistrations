'use strict';

var identity = require('es5-ext/function/identity')
  , _        = require('mano').i18n.bind('Registration');

module.exports = exports = function (context) {
	var businessProcess = context.businessProcess
	  , revision = businessProcess.processingSteps.map.revision;
	return [h3(_("Remark")),
		p(_("We have made following comments to your application:")),
		ul(_if(revision && revision._isSentBack, [
			_if(businessProcess.requirementUploads.rejected._size,
				li(h4(_("Issues with uploaded documents:")), div({ class: 'free-form' },
					ul(businessProcess.requirementUploads.rejected, function (requirementUpload) {
						return [h4(requirementUpload.document.label),
							_if(eq(requirementUpload.rejectReasons._size, 1),
								p(requirementUpload.rejectReasons._first),
								ul(requirementUpload.rejectReasons, identity))];
					})))),
			_if(businessProcess.paymentReceiptUploads.rejected._size,
				li(h4(_("Issues with uploaded payment receipts:"), div({ class: 'free-form' },
					ul(businessProcess.paymentReceiptUploads.rejected, function (paymentReceiptUpload) {
						return [h4(paymentReceiptUpload.document.label),
							p(paymentReceiptUpload._rejectReasonMemo)];
					})))))
		]), exports._otherInfo()),
		p(mdi(_("After all issues are cleared, please [re-submit](/submission/#submit-form) " +
			"application")))];
};

exports._otherInfo = Function.prototype;
