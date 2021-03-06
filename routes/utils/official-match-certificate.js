'use strict';

module.exports = function (uniqueKey) {
	var target = this.processingStep || this.businessProcess;
	target.certificates.released.some(function (certificate) {
		if (certificate.uniqueKey === uniqueKey) {
			this.document = certificate;
			return true;
		}
	}, this);
	if (!this.document) return false;
	if (this.businessProcess.isClosed) {
		if (!this.businessProcess.isApproved) return false;
		this.businessProcess.certificates.dataSnapshot.resolved.some(function (data) {
			if (data.uniqueKey === uniqueKey) {
				this.dataSnapshot = data;
				return true;
			}
		}, this);
		if (!this.dataSnapshot) return;
	}
	this.documentKind = 'certificate';
	this.documentUniqueKey = uniqueKey;
	this.documentUniqueId = target.__id__ + '/' + this.documentKind + '/' + uniqueKey;
	return true;
};
