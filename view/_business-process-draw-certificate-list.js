// Certificate list

'use strict';

var camelToHyphen    = require('es5-ext/string/#/camel-to-hyphen')
  , _                = require('mano').i18n.bind('User Submitted');

module.exports = function (target, urlPrefix) {
	return _if(target.certificates.uploaded._size, [
		div(
			{ class: 'table-responsive-container' },
			table(
				{ class: 'submitted-user-data-table user-request-table' },
				thead(
					tr(
						th({ class: 'submitted-user-data-table-status' }),
						th(_("Certificates")),
						th(_("Issuer")),
						th({ class: 'submitted-user-data-table-date' }, _("Issue date")),
						th(_("Number")),
						th({ class: 'submitted-user-data-table-link' })
					)
				),
				tbody(
					target.certificates.uploaded,
					function (certificate) {
						td({ class: 'submitted-user-data-table-status' },
							span({ class: 'fa fa-certificate' }));
						td(certificate.label);
						td(certificate._issuedBy);
						td({ class: 'submitted-user-data-table-date' }, certificate._issueDate);
						td(certificate._number);
						td({ class: 'submitted-user-data-table-link' },
							a({ href: urlPrefix + 'certificate/' +
								camelToHyphen.call(certificate.key) + '/' },
								span({ class: 'fa fa-search' }, _("Go to"))));
					}
				)
			)
		)
	]);
};
