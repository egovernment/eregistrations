'use strict';

var renderDocument       = require('./_business-process-document')
  , documentRevisionInfo = require('./_business-process-document-review-info');

exports._parent = require('./user-base');
exports._match = 'documentUniqueId';

exports['sub-main'] = {
	class: { content: true, 'user-forms': true },
	content: function () {

		insert(renderDocument(this,
			(this.documentKind !== 'certificate') ? documentRevisionInfo(this) : null));
	}
};
