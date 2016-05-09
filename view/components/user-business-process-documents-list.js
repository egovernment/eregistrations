// User: Chosen business process main display documents

'use strict';

var assign                = require('es5-ext/object/assign')
  , aFrom                 = require('es5-ext/array/from')
  , _                     = require('mano').i18n.bind('View: Documents list')
  , getUploads            = require('../utils/get-uploads-list')
  , getCertificates       = require('../utils/get-certificates-list')
  , getResolveDocumentUrl = require('../utils/get-resolve-document-url');

var compareByLabel = function (a, b) {
	return a.label.toLowerCase().localeCompare(b.label.toLowerCase());
};

module.exports = function (context) {
	var businessProcess = context.businessProcess
	  , options = { urlPrefix: '/business-process/' + businessProcess.__id__ + '/' };

	var resolveUploadUrl = getResolveDocumentUrl('requirementUpload',
		getUploads(businessProcess.requirementUploads, context.appName), assign({
			documentsRootHref: '/business-process/' + businessProcess.__id__ + '/documents/'
		}, options));
	var resolveCertificateUrl = getResolveDocumentUrl('certificate',
		getCertificates(businessProcess.certificates, context.appName), options);

	return div({ class: "table-responsive-container" },
		mmap(businessProcess.requirementUploads.dataSnapshot._resolved, function (uploadsData) {
			if (uploadsData) {
				uploadsData.forEach(function (documentData) { documentData.kind = 'document'; });
			}
			return mmap(businessProcess._isApproved, function (isApproved) {
				return mmap(businessProcess.certificates.dataSnapshot._resolved, function (certsData) {
					var data;
					if (certsData && isApproved) {
						certsData.forEach(function (documentData) { documentData.kind = 'certificate'; });
						if (uploadsData) data = uploadsData.concat(certsData);
						else data = aFrom(certsData);
					} else {
						data = aFrom(uploadsData);
					}
					if (data) data = data.sort(compareByLabel).slice(0, 5);
					return table({ class: 'submitted-user-data-table user-request-table' },
						thead(
							tr(
								th({ class: 'submitted-user-data-table-status' }),
								th(_("Name")),
								th(_("Issuer")),
								th({ class: 'submitted-user-data-table-date' }, _("Issue date")),
								th({ class: 'submitted-user-data-table-link' })
							)
						),
						tbody(!data
							? tr({ class: 'empty' }, td({ colspan: 5 }, _("No documents")))
							: data.map(function (documentData) {
								return tr(
									td({ class: 'submitted-user-data-table-status' },
										(documentData.kind === 'certificate')
										? span({ class: 'fa fa-certificate' }) : null),
									td(documentData.label),
									td(documentData.issuedBy),
									td({ class: 'submitted-user-data-table-date' }, documentData.issueDate),
									td({ class: 'submitted-user-data-table-link' },
										a({ href: (documentData.kind === 'certificate')
											? resolveCertificateUrl(documentData)
											: resolveUploadUrl(documentData) },
											span({ class: 'fa fa-search' }, _("Go to"))))
								);
							})));
				});
			});
		}));
};
