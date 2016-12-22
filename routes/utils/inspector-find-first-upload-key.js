'use strict';

module.exports = function (kind) {
	var colName = kind + 's'
	  , uploads = this.businessProcess[colName]
	  , first;

	if (!this.businessProcess.isSubmitted) {
		first = uploads.applicable.first;

		if (!first) return;
		if (kind === 'requirementUpload') return first.document.uniqueKey;
		return first.key;
	}
	first = uploads.dataSnapshot.resolved[0];

	if (!first) return;
	return first.uniqueKey;
};
