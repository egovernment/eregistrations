'use strict';

module.exports = function (bp) {
	var files = [];
	bp.requirementUploads.applicable.forEach(function (upload) {
		upload.document.files.ordered.forEach(function (file) { files.push(file); });
	});
	bp.paymentReceiptUploads.applicable.forEach(function (upload) {
		upload.document.files.ordered.forEach(function (file) { files.push(file); });
	});
	bp.certificates.applicable.forEach(function (document) {
		document.files.ordered.forEach(function (file) { files.push(file); });
	});
	return files;
};
