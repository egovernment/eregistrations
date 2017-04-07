'use strict';

var findFirstUploadKey = require('./inspector-find-first-upload-key')
  , matchUpload        = require('./inspector-match-upload');

module.exports = function () {
	var firstUniqueKey = findFirstUploadKey.call(this, 'paymentReceiptUpload');

	if (!firstUniqueKey) return false;

	return matchUpload.call(this, 'paymentReceiptUpload', firstUniqueKey);
};
