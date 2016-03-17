'use strict';

var _ = require('mano').i18n.bind("View: Documents")
  , renderDocumentsList = require('./_user-business-process-documents-list');

exports._parent = require('./user-base');
exports._match = 'businessProcess';

exports['sub-main'] = function () {
	var businessProcess = this.businessProcess;
	div({ class: "content user-forms" },
		h2(_("Documents of ${businessName}",
			{ businessName: businessProcess._businessName })),
		div({ class: "section-primary" },
			renderDocumentsList(businessProcess.documents.processChainUploaded)));
};
