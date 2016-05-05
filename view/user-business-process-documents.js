'use strict';

var assign                = require('es5-ext/object/assign')
  , _                     = require('mano').i18n.bind("View: User")
  , renderDocumentsList   = require('./components/business-process-documents-list')
  , renderCertificateList = require('./components/business-process-certificates-list');

exports._parent = require('./user-base');
exports._match = 'businessProcess';

exports['sub-main'] = function () {
	var options = { urlPrefix: '/business-process/' + this.businessProcess.__id__ + '/' };
	div({ class: "content user-forms" },
		h2(_("Documents of ${businessName}",
			{ businessName: this.businessProcess._businessName })),
		section({ class: 'section-primary' },
			div({ class: "section-primary-sub all-documents-table" },
				div(renderCertificateList(this, options)),
				div(renderDocumentsList(this, assign(options, {
					documentsRootHref: '/business-process/' + this.businessProcess.__id__ + '/documents/'
				})))),
			div({ id: 'selection-preview' })));
};
