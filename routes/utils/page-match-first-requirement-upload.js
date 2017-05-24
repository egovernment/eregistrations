'use strict';

var findFirstUploadKey = require('./page-find-first-upload-key')
  , matchUpload        = require('./page-match-upload');

module.exports = function () {
	var firstUniqueKey = findFirstUploadKey.call(this, 'requirementUpload');

	if (!firstUniqueKey) return false;

	return matchUpload.call(this, 'requirementUpload', firstUniqueKey);
};
