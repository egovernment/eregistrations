'use strict';

module.exports = function (kind, uniqueKey) {
	var colName = kind + 's';
	this.businessProcess[colName].dataSnapshot.resolved.some(function (data) {
		if (data.uniqueKey === uniqueKey) {
			this.dataSnapshot = data;
			return true;
		}
	}, this);
	if (!this.dataSnapshot) return false;
	this.businessProcess[colName].applicable.some(function (upload) {
		var uploadKey = (kind === 'requirementUpload') ? upload.document.uniqueKey : upload.key;
		if (uploadKey === uniqueKey) {
			this.document = upload.document;
			return true;
		}
	}, this);
	this.documentKind = kind;
	this.documentUniqueKey = uniqueKey;
	this.documentUniqueId = this.businessProcess.__id__ + '/' + this.documentKind + '/' + uniqueKey;
	return true;
};
