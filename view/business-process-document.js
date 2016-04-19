'use strict';

var renderDocument       = require('./_business-process-document')
  , documentRevisionInfo = require('./_business-process-document-review-info');

exports._parent = require('./user-base');
exports._match = 'document';

exports['sub-main'] = {
	class: { content: true, 'user-forms': true },
	content: function () {
		var doc = this.document;

		renderDocument(doc, doc.isCertificate ? null : documentRevisionInfo(doc));
	}
};
