// Certificate list

'use strict';

var camelToHyphen    = require('es5-ext/string/#/camel-to-hyphen')
  , _                = require('mano').i18n.bind('User Submitted')
  , _d = _;

module.exports = function (businessProcess, options) {
	var target = options.uploadsResolver || businessProcess
	  , urlPrefix = options.urlPrefix || '/';
	return _if(target.certificates.uploaded._size, [
		div(
			{ class: 'table-responsive-container' },
			table(
				{ class: 'submitted-user-data-table user-request-table' },
				thead(
					tr(
						th({ class: 'submitted-user-data-table-status' }),
						th({ class: 'submitted-user-data-table-label' }, _("Certificates")),
						th({ class: 'submitted-user-data-table-date' }, _("Issue date")),
						th(_("Issuer")),
						th({ class: 'submitted-user-data-table-link' })
					)
				),
				tbody(
					target.certificates.uploaded,
					function (certificate) {
						return tr({ id: 'document-item-' +
							camelToHyphen.call(certificate.key) },
							td({ class: 'submitted-user-data-table-status' },
								span({ class: 'fa fa-certificate' })),
							td({ class: 'submitted-user-data-table-label' },
								_d(certificate.label, certificate.getTranslations())),
							td({ class: 'submitted-user-data-table-date' }, certificate._issueDate),
							td(certificate._issuedBy),
							td({ class: 'submitted-user-data-table-link' },
								a({ href: urlPrefix + certificate.docUrl },
									span({ class: 'fa fa-search' }, _("Go to"))))
							);
					}
				)
			)
		)
	]);
};
