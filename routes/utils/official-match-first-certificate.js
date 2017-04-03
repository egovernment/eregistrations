'use strict';

var matchCertificate = require('./official-match-certificate');

module.exports = function () {
	var target = this.processingStep || this.businessProcess
	  , firstUpload;

	firstUpload = target.certificates.released.first;

	if (!firstUpload) return false;

	return matchCertificate.call(this, firstUpload.uniqueKey);
};
