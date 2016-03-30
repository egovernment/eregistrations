'use strict';

var renderDocument = require('./_business-process-document')
  , _ = require('mano').i18n.bind('View: Official');

exports._parent = require('./user-base');
exports._match = 'document';

exports['sub-main'] = {
	class: { content: true, 'user-forms': true },
	content: function () {
		var rejectReasonDescription = insert(_if(eq(this.document.owner._status, 'invalid'),
			div({ class: 'info-main' },
				p(_('This document was rejected for following reason:'), ' '),
				p(this.document.owner.rejectReasonMemo))));
		renderDocument(this.document, rejectReasonDescription);
	}
};
