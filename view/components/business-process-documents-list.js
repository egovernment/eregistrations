// Documents list

'use strict';

var normalizeOptions      = require('es5-ext/object/normalize-options')
  , camelToHyphen         = require('es5-ext/string/#/camel-to-hyphen')
  , _                     = require('mano').i18n.bind('View: Component: Documents')
  , getUploads            = require('../utils/get-uploads-list')
  , getResolveDocumentUrl = require('../utils/get-resolve-document-url');

module.exports = function (context/*, options*/) {
	var options            = normalizeOptions(arguments[1])
	  , businessProcess    = context.businessProcess
	  , target             = options.uploadsResolver || businessProcess
	  , uploads            = getUploads(target.requirementUploads, context.appName)
	  , resolveDocumentUrl = getResolveDocumentUrl('requirementUpload', uploads, options);

	return mmap(uploads, function (data) {
		if (!data) return;
		return _if(data._length || data.length, function () {
			return div({ class: 'table-responsive-container' },
				table({
					class: 'submitted-user-data-table user-request-table',
					configuration: {
						collection: uploads,
						columns: [{
							class: 'submitted-user-data-table-status',
							data: function (upload) {
								return [
									_if(eq(upload.status, 'approved'),
										a({ href: resolveDocumentUrl(upload) }, span({ class: 'fa fa-check' }))),
									_if(eq(upload.status, 'rejected'),
										a({ href: resolveDocumentUrl(upload) }, span({ class: 'fa fa-exclamation' })))
								];
							}
						}, {
							class: 'submitted-user-data-table-label',
							head: _("Documents"),
							data: function (upload) {
								return a({ href: resolveDocumentUrl(upload) }, upload.label);
							}
						}, {
							class: 'submitted-user-data-table-date',
							head: _("Emission date"),
							data: function (upload) {
								return a({ href: resolveDocumentUrl(upload) }, upload.issueDate);
							}
						}, {
							head: _("Emissor"),
							data: function (upload) {
								return a({ href: resolveDocumentUrl(upload) }, upload.uploadedBy);
							}
						}],
						rowAttributes: function (upload) {
							return { id: 'document-item-' + camelToHyphen.call(upload.uniqueKey) };
						}
					}
				}));
		});
	});
};
