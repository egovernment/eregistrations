'use strict';

var _        = require('mano').i18n.bind('View: Official')
  , identity = require('es5-ext/function/identity');

module.exports = function (doc) {
	var upload                 = doc.owner
	  , revisionStatus         = upload._status
	  , isPaymentReceiptUpload = eq(upload.constructor.__id__, 'PaymentReceiptUpload');

	if (doc.isCertificate) return;

	// Don't display anything if not rejected.
	return _if(eq(revisionStatus, 'invalid'), div({
		class: 'section-secondary'
	}, _if(isPaymentReceiptUpload, [
		h4(_("This payment receipt was rejected for the following reason(s)"), ':'),
		p(upload._rejectReasonMemo)
	], [
		h4(_("This document was rejected for the following reason(s)"), ':'),
		_if(eq(upload.rejectReasons._size, 1), p(upload.rejectReasons._first),
			ul(upload.rejectReasons, identity))
	])));

};
