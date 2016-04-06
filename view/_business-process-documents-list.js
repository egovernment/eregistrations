// Documents list

'use strict';

var _                = require('mano').i18n.bind('User Submitted')
  , camelToHyphen  = require('es5-ext/string/#/camel-to-hyphen')
  , _d = _;

module.exports = function (doc, options) {
	return _if(options.documentsTarget.requirementUploads.applicable._size, [
		div(
			{ class: 'table-responsive-container' },
			table(
				{ class: 'submitted-user-data-table user-request-table' },
				thead(
					tr(
						th({ class: 'submitted-user-data-table-status' }),
						th({ class: 'submitted-user-data-table-label' }, _("Documents")),
						th({ class: 'submitted-user-data-table-date' }, _("Issue date")),
						th(_("Issuer")),
						th({ class: 'submitted-user-data-table-link' })
					)
				),
				tbody(
					options.documentsTarget.requirementUploads.applicable,
					function (requirementUpload) {
						return tr({ id: 'document-item-' +
							camelToHyphen.call(requirementUpload.document.uniqueKey) },
							td({ class: 'submitted-user-data-table-status' },
								_if(requirementUpload._isApproved, span({ class: 'fa fa-check' })),
								_if(requirementUpload._isRejected, span({ class: 'fa fa-exclamation' }))
								),
							td({ class: 'submitted-user-data-table-label' },
								_d(requirementUpload.document.label,
									requirementUpload.document.getTranslations())),
							td({ class: 'submitted-user-data-table-date' },
								requirementUpload.document._issueDate),
							td(requirementUpload.document._issuedBy),
							td({ class: 'submitted-user-data-table-link' },
								a({ href: options.urlPrefix + requirementUpload.document.docUrl },
									span({ class: 'fa fa-search' }, _("Go to"))))
							);
					}
				)
			)
		)
	]);

};
