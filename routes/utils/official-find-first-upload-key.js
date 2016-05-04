'use strict';

module.exports = function (kind) {
	var colName = kind + 's', first, snapshot;
	if (!this.businessProcesss.isClosed) {
		first = this.processingStep[colName].applicable.first;
	} else {
		snapshot = this.businessProcess[colName].dataSnapshot.resolved;

		// Find first viewable document
		this.processingStep[colName].applicable.some(function (upload) {
			var uploadKey = (kind === 'requirementUpload') ? upload.document.uniqueKey : upload.key;
			return snapshot.some(function (data) {
				if (data.uniqueKey === uploadKey) {
					first = upload;
					return true;
				}
			});
		});
	}
	if (!first) return;
	if (kind === 'requirementUpload') return first.document.uniqueKey;
	return first.key;
};
