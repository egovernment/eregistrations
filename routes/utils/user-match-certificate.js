'use strict';

module.exports = function (uniqueKey) {
	this.businessProcess.certificates.dataSnapshot.resolved.some(function (data) {
		if (data.uniqueKey === uniqueKey) {
			this.dataSnapshot = data;
			return true;
		}
	}, this);
	if (!this.dataSnapshot) return false;
	this.businessProcess.certificates.applicable.some(function (certificate) {
		if (certificate.key === uniqueKey) {
			this.document = certificate;
			return true;
		}
	}, this);
	this.documentKind = 'certificate';
	this.documentUniqueKey = uniqueKey;
	this.documentUniqueId = this.businessProcess.__id__ + '/' + this.documentKind + '/' + uniqueKey;
	return true;
};
