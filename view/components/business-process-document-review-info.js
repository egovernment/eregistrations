'use strict';

var _             = require('mano').i18n.bind('View: Component: Documents')
  , identity      = require('es5-ext/function/identity')
  , getArrayIndex = require('../../utils/get-observable-array-index');

module.exports = function (snapshot, kind) {
	// Don't display anything if not rejected.
	return _if(eq(snapshot.status, 'rejected'), function () {
		return div({ class: 'entities-overview-info' },
			(kind === 'paymentReceiptUpload')
			? [h4(_("This payment receipt was rejected for the following reason(s)")),
					p(getArrayIndex(snapshot.rejectReasons, 0))]
			: [h4(_("This document was rejected for the following reason(s)")),
					_if(eq(snapshot.rejectReasons._length || snapshot.rejectReasons.length, 1),
						p(getArrayIndex(snapshot.rejectReasons, 0)),
						ul(snapshot.rejectReasons, identity))]);
	});
};
