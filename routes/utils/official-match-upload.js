'use strict';

module.exports = function (kind, uniqueKey) {
	var colName = kind + 's';
	this.processingStep[colName].applicable.some(function (upload) {
		var uploadKey = (kind === 'requirementUpload') ? upload.document.uniqueKey : upload.key;
		if (uploadKey === uniqueKey) {
			this.document = upload.document;
			return true;
		}
	}, this);
	if (!this.document) return false;
	this.businessProcess[colName].dataSnapshot.resolved.some(function (data) {
		if (data.uniqueKey === uniqueKey) {
			this.dataSnapshot = data;
			return true;
		}
	}, this);
	if (!this.dataSnapshot) {
		// If no snapshot we show document only if file is not yet closed
		if (this.businessProcess.isClosed) return false;
		this.dataSnapshot = this.document.owner.enrichJSON(this.document.owner.toJSON());
	}
	this.documentKind = kind;
	this.documentUniqueKey = uniqueKey;
	this.documentUniqueId = this.processingStep.__id__ + '/' + this.documentKind + '/' + uniqueKey;
	return true;
};
