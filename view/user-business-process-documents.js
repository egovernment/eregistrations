'use strict';

var _                     = require('mano').i18n.bind("View: User")
  , renderDocumentsList   = require('./components/business-process-documents-list')
  , renderCertificateList = require('./components/business-process-certificates-list');

exports._parent = require('./user-base');
exports._match = 'businessProcess';

exports['sub-main'] = function () {
	var businessProcess = this.businessProcess;
	div({ class: "content user-forms" },
		h2(_("Documents of ${businessName}",
			{ businessName: businessProcess._businessName })),
		section({ class: 'section-primary' },
			div({ class: "section-primary-sub all-documents-table" },
				div(renderCertificateList(this)),
				div(renderDocumentsList(this))),
			div({ id: 'selection-preview' })));
};
