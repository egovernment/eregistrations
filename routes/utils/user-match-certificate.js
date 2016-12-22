'use strict';

var normalizeOptions = require('es5-ext/object/normalize-options');

// This module is used by user, business-process-submitted and inspector routes.
module.exports = function (uniqueKey/*, options*/) {
	var options    = normalizeOptions(arguments[1])
	  , collection = options.collection || 'userApplicable';

	if (this.businessProcess.isClosed) {
		if (!this.businessProcess.isApproved) return false;

		this.businessProcess.certificates.dataSnapshot.resolved.some(function (data) {
			if (data.uniqueKey === uniqueKey) {
				this.dataSnapshot = data;
				return true;
			}
		}, this);
		if (!this.dataSnapshot) return false;
	}

	this.businessProcess.certificates[collection].some(function (certificate) {
		if (certificate.key === uniqueKey) {
			this.document = certificate;
			return true;
		}
	}, this);

	if (!this.businessProcess.isClosed && !this.document) return false;

	this.documentKind = 'certificate';
	this.documentUniqueKey = uniqueKey;
	this.documentUniqueId = this.businessProcess.__id__ + '/' + this.documentKind + '/' + uniqueKey;
	return true;
};
