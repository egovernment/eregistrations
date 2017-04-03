'use strict';

var matchUpload = require('./user-match-upload');

module.exports = function () {
	var firstUpload = this.businessProcess.requirementUploads.dataSnapshot.resolved[0];

	if (!firstUpload) return false;

	return matchUpload.call(this, 'requirementUpload', firstUpload.uniqueKey);
};
