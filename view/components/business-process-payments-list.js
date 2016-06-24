// Payment receipt uploads list

'use strict';

var normalizeOptions      = require('es5-ext/object/normalize-options')
  , camelToHyphen         = require('es5-ext/string/#/camel-to-hyphen')
  , _                     = require('mano').i18n.bind('View: Component: Payments')
  , getUploads            = require('../utils/get-uploads-list')
  , getResolveDocumentUrl = require('../utils/get-resolve-document-url');

module.exports = exports = function (context/*, options*/) {
	var options            = normalizeOptions(arguments[1])
	  , businessProcess    = context.businessProcess
	  , target             = options.uploadsResolver || businessProcess
	  , uploads            = getUploads(target.paymentReceiptUploads, context.appName)
	  , resolveDocumentUrl = getResolveDocumentUrl('paymentReceiptUpload', uploads, options);

	return mmap(uploads, function (data) {
		if (!data) return;
		return _if(data._length || data.length, function () {
			return div({ class: 'table-responsive-container' },
				table({
					class: 'submitted-user-data-table user-request-table',
					configuration: {
						collection: uploads,
						columns: exports.columns,
						rowAttributes: function (upload) {
							return { id: 'receipt-item-' + camelToHyphen.call(upload.uniqueKey) };
						},
						thisArg: { resolveDocumentUrl: resolveDocumentUrl }
					}
				}));
		});
	});
};

exports.statusColumn = {
	class: 'submitted-user-data-table-status',
	data: function (upload) {
		return [
			_if(eq(upload.status, 'approved'), a({ href: this.resolveDocumentUrl(upload) },
				span({ class: 'fa fa-check' }))),
			_if(eq(upload.status, 'rejected'), a({ href: this.resolveDocumentUrl(upload) },
				span({ class: 'fa fa-exclamation' })))
		];
	}
};

exports.labelColumn = {
	class: 'submitted-user-data-table-label',
	head: _("Payment receipts"),
	data: function (upload) { return a({ href: this.resolveDocumentUrl(upload) }, upload.label); }
};

exports.emissionDateColumn = {
	class: 'submitted-user-data-table-date',
	head: _("Emission date"),
	data: function (upload) {
		return a({ href: this.resolveDocumentUrl(upload) }, upload.issueDate);
	}
};

exports.emissorColumn = {
	head: _("Emissor"),
	data: function (upload) {
		return a({ href: this.resolveDocumentUrl(upload) }, _("User"));
	}
};

exports.columns = [exports.statusColumn, exports.labelColumn, exports.emissionDateColumn,
	exports.emissorColumn];
