// Certificate list

'use strict';

var _                = require('mano').i18n.bind('View: Component: Certificates')
  , normalizeOptions = require('es5-ext/object/normalize-options')
  , _d = _;

module.exports = function (businessProcess/*, options*/) {
	var options      = normalizeOptions(arguments[1])
	  , urlPrefix    = options.urlPrefix || '/'
	  , target       = options.uploadsResolver || businessProcess
	  , certificates = target.certificates.uploaded;

	return _if(certificates._size, div(
		{ class: 'table-responsive-container' },
		table({ class: 'submitted-user-data-table user-request-table', configuration: {
			collection: certificates,
			columns: [{
				class: 'submitted-user-data-table-status',
				data: function () { return span({ class: 'fa fa-certificate' }); }
			}, {
				class: 'submitted-user-data-table-label',
				head: _("Certificates"),
				data: function (doc) {
					return _d(doc.label, doc.getTranslations());
				}
			}, {
				class: 'submitted-user-data-table-date',
				head: _("Issue date"),
				data: function (doc) {
					return doc._issueDate;
				}
			}, {
				head: _("Issuer"),
				data: function (doc) {
					return doc._issuedBy;
				}
			}, {
				class: 'submitted-user-data-table-link',
				data: function (doc) {
					return a(
						{ href: urlPrefix + doc.docUrl },
						span({ class: 'fa fa-search' }, _("Go to"))
					);
				}
			}],
			headRowAttributes: {},
			rowAttributes: function (doc) {
				return { id: 'certificate-item-' + doc.docId };
			}
		} })
	));
};
