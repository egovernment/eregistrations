'use strict';

module.exports = function (kind) {
	var colName = kind + 's', target = this.processingStep || this.businessProcess, first, snapshot;
	if (!this.businessProcess.isClosed) {
		first = target[colName].applicable.first;
	} else {
		snapshot = this.businessProcess[colName].dataSnapshot.resolved;

		// Find first viewable document
		target[colName].applicable.some(function (upload) {
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
