'use strict';

var renderDocument = require('./_business-process-document')
  , _ = require('mano').i18n.bind('View: Official')
  , identity = require('es5-ext/function/identity');

exports._parent = require('./user-base');
exports._match = 'document';

exports['sub-main'] = {
	class: { content: true, 'user-forms': true },
	content: function () {
		var rejectReasonDescription = insert(_if(eq(this.document.owner._status, 'invalid'),
			div({ class: 'info-main' },
				p(_('This document was rejected for following reasons:'), ' '),
				p(this.document.owner.rejectReasonMemo))));
		renderDocument(this.document, rejectReasonDescription);
	}
};
