'use strict';

var renderDocument       = require('./_business-process-document')
  , documentRevisionInfo = require('./_business-process-document-review-info');

exports._parent = require('./user-base');
exports._match = 'documentUniqueId';

exports['sub-main'] = {
	class: { content: true, 'user-forms': true },
	content: function () {

		renderDocument(this, (this.kind !== 'certificate') ? documentRevisionInfo(this) : null);
	}
};
