// Documents list and user data

'use strict';

var camelToHyphen    = require('es5-ext/string/#/camel-to-hyphen')
  , _                = require('mano').i18n.bind('User Submitted');

exports._parent = require('./business-process-revision');

exports['official-revision-datas'] = { class: { active: true } };
exports['official-revision-content'] = function () {
	var options = Object(arguments[1])
	  , urlPrefix = options.urlPrefix || '/'
	  , businessProcess = this.businessProcess;

	return [section({ class: 'section-primary' },
		_if(businessProcess.certificates.uploaded._size,
			[h3(_("Datas")),
				div(
					{ class: 'table-responsive-container' },
					table(
						{ class: 'submitted-user-data-table user-request-table' },
						thead(
							tr(
								th({ class: 'submitted-user-data-table-status' }),
								th(_("Name")),
								th(_("Issuer")),
								th({ class: 'submitted-user-data-table-date' }, _("Issue date")),
								th({ class: 'submitted-user-data-table-link' })
							)
						),
						tbody(
							businessProcess.certificates.uploaded,
							function (certificate) {
								td({ class: 'submitted-user-data-table-status' },
									span({ class: 'fa fa-certificate' }));
								td(certificate.label);
								td(certificate._issuedBy);
								td({ class: 'submitted-user-data-table-date' }, certificate._issueDate);
								td({ class: 'submitted-user-data-table-link' },
									a({ href: urlPrefix + 'certificate/' +
										camelToHyphen.call(certificate.key) + '/' },
										span({ class: 'fa fa-search' }, _("Go to"))));
							}
						)
					)
				)]))];
};
