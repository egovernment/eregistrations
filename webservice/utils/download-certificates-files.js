'use strict';

var deferred = require('deferred')
  , getFileFromUrl = require('../../server/utils/get-file-from-url')
  , camelToHyphen = require('es5-ext/string/#/camel-to-hyphen')
  , generateThumbAndPreview = require('../../server/generate-thumb-and-preview');

/**
 * certsArr - certficates array as represented in toWebServiceJson
*/
module.exports = function (bp, certsArr) {
	return deferred.map(certsArr, function (theirCert) {
		return deferred.map(theirCert.files, function (certUrl) {
			var fileName = camelToHyphen.call(theirCert.code);
			var filePath = bp.__id__ + '-' + fileName;
			return getFileFromUrl(certUrl, filePath).then(function (mimeType) {
				var certFile = bp.certificates.map[theirCert.code].files.map.newUniq();
				var ext = '.' + mimeType.split('/')[1];
				certFile.name = fileName;
				certFile.path = filePath + ext;
				certFile.type = mimeType;

				return generateThumbAndPreview(certFile);
			});
		});
	});
};
