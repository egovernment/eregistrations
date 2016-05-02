// Certificate list

'use strict';

var normalizeOptions = require('es5-ext/object/normalize-options')
  , camelToHyphen    = require('es5-ext/string/#/camel-to-hyphen')
  , _                = require('mano').i18n.bind('View: Component: Certificates')
  , getCertificates  = require('../utils/get-certificates-list')

  , _d = _;

module.exports = function (context/*, options*/) {
	var options         = normalizeOptions(arguments[1])
	  , businessProcess = context.businessProcess
	  , urlPrefix       = options.urlPrefix || '/'
	  , target          = options.uploadsResolver || businessProcess
	  , certificates    = getCertificates(target.certificates, context.appName);

	return mmap(certificates, function (data) {
		if (!data) return;
		return _if(data._length || data.length, function () {
			return div({ class: 'table-responsive-container' },
				table({
					class: 'submitted-user-data-table user-request-table',
					configuration: {
						collection: data.map(function (certificate) {
							if (!certificate.__id__) return certificate;
							return {
								label: certificate._label.map(function (label) {
									return _d(label, certificate.getTranslations());
								}),
								issuedBy: certificate._issuedBy,
								issueDate: certificate._issueDate,
								number: certificate._number,
								uniqueKey: certificate.key
							};
						}),
						columns: [{
							class: 'submitted-user-data-table-status',
							data: function () { return span({ class: 'fa fa-certificate' }); }
						}, {
							class: 'submitted-user-data-table-label',
							head: _("Certificates"),
							data: function (certificate) { return certificate.label; }
						}, {
							class: 'submitted-user-data-table-date',
							head: _("Emission date"),
							data: function (certificate) { return certificate.issueDate; }
						}, {
							head: _("Emissor"),
							data: function (certificate) { return certificate.issuedBy; }
						}, {
							class: 'submitted-user-data-table-link',
							data: function (certificate) {
								return a({ href: urlPrefix + 'certificates/' +
									camelToHyphen.call(certificate.uniqueKey) + '/' },
									span({ class: 'fa fa-search' }, _("Go to")));
							}
						}],
						rowAttributes: function (certificate) {
							return { id: 'certificate-item-' + camelToHyphen.call(certificate.uniqueKey) };
						}
					}
				}));
		});
	});
};
