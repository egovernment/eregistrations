'use strict';

var renderDocument = require('./_business-process-document');

exports._parent = require('./user-base');
exports._match = 'document';

exports['sub-main'] = {
	class: { content: true, 'user-forms': true },
	content: function () {
		renderDocument(this.document);
	}
};
