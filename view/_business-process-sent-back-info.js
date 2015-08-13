'use strict';

var _  = require('mano').i18n.bind('Registration');

module.exports = exports = function (context) {
	var businessProcess = context.businessProcess
	  , revision = businessProcess.processingSteps.map.revision;
	return [h3(_("Remark")),
		p(_("We have made the comments to your application:")),
		_if(revision && revision._isSentBack, [
			_if(businessProcess.requirementUploads.rejected._size,
				ul(businessProcess.requirementUploads.rejected, function (requirementUpload) {
					return [h4(requirementUpload.document.label),
						_if(eq(requirementUpload.rejectReasons._size, 1),
							p(requirementUpload.rejectReasons._first), ul(requirementUpload.rejectReasons))];
				})),
			_if(businessProcess.paymentReceiptUploads.rejected._size,
				ul(businessProcess.paymentReceiptUploads.rejected, function (paymentReceiptUpload) {
					return [h4(paymentReceiptUpload.document.label),
						p(paymentReceiptUpload._rejectReasonMemo)];
				}))
		]),
		exports._otherInfo()];
};

exports._otherInfo = Function.prototype;
