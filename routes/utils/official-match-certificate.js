'use strict';

module.exports = function (uniqueKey) {
	this.processingStep.certificates.released.some(function (certificate) {
		if (certificate.key === uniqueKey) {
			this.document = certificate;
			return true;
		}
	}, this);
	if (!this.document) return false;
	if (this.businessProcess.isClosed) {
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
	this.documentUniqueId = this.processingStep.__id__ + '/' + this.documentKind + '/' + uniqueKey;
	return true;
};
