// Documents list

'use strict';

var _                = require('mano').i18n.bind('User Submitted')
  , _d = _;

module.exports = function (target, urlPrefix) {
	return _if(target.requirementUploads.applicable._size, [
		h3(_("Documents required")),
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
					target.requirementUploads.applicable,
					function (requirementUpload) {
						td(
							{ class: 'submitted-user-data-table-status' },
							_if(requirementUpload._isApproved, span({ class: 'fa fa-check' })),
							_if(requirementUpload._isRejected, span({ class: 'fa fa-exclamation' }))
						);
						td(_d(requirementUpload.document._label, { user: requirementUpload.master }));
						td(requirementUpload.document._issuedBy);
						td({ class: 'submitted-user-data-table-date' }, requirementUpload.document._issueDate);
						td({ class: 'submitted-user-data-table-link' },
							a({ href: urlPrefix + requirementUpload.document.docUrl },
								span({ class: 'fa fa-search' }, _("Go to"))));
					}
				)
			)
		)
	]);
};
