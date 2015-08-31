'use strict';

var _ = require('mano').i18n.bind("View: Documents");

exports._parent = require('./user-base');
exports._match = 'businessProcess';

exports['sub-main'] = function () {
	var businessProcess = this.businessProcess;
	div({ class: "content user-forms" },
		div({ class: "section-primary" },
			h2(_("Documents of ${businessName}",
					{ businessName: businessProcess._businessName })),
			hr(),
			require('./_user-business-process-documents-list')(
				businessProcess.documents.processChainUploaded
			)));
};
