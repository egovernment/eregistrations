'use strict';

var matchCertificate = require('./user-match-certificate');

module.exports = function () {
	var firstUpload;

	if (!this.businessProcess.isApproved) return false;

	firstUpload = this.businessProcess.certificates.dataSnapshot.resolved[0];

	if (!firstUpload) return false;

	return matchCertificate.call(this, firstUpload.uniqueKey, { collection: 'applicable' });
};
