'use strict';

var findFirstUploadKey = require('./official-find-first-upload-key')
  , matchUpload        = require('./official-match-upload');

module.exports = function () {
	var firstUniqueKey = findFirstUploadKey.call(this, 'paymentReceiptUpload');

	if (!firstUniqueKey) return false;

	return matchUpload.call(this, 'paymentReceiptUpload', firstUniqueKey);
};
