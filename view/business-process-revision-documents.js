// Documents list and user data

'use strict';

var camelToHyphen    = require('es5-ext/string/#/camel-to-hyphen')
  , _                = require('mano').i18n.bind('User Submitted')
  , _d = _;

exports._parent = require('./business-process-revision');

exports['official-revision-documents'] = { class: { active: true } };
exports['official-revision-content'] = function (businessProcess/*, options*/) {
	var options = Object(arguments[1])
	  , urlPrefix = options.urlPrefix || '/';

	return [section({ class: 'section-primary' },
		_if(businessProcess.requirementUploads.applicable._size,
			[h3(_("Documents required")),
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
							businessProcess.requirementUploads.applicable,
							function (requirementUpload) {
								td({ class: 'submitted-user-data-table-status' },
									_if(requirementUpload._isApproved, span({ class: 'fa fa-check' })),
										_if(requirementUpload._isRejected, span({ class: 'fa fa-exclamation' })));
								td(_d(requirementUpload.document._label, { user: requirementUpload.master }));
								td(requirementUpload.document._issuedBy);
								td({ class: 'submitted-user-data-table-date' },
										requirementUpload.document._issueDate);
								td({ class: 'submitted-user-data-table-link' },
									a({ href: urlPrefix + 'document/' +
										camelToHyphen.call(requirementUpload.document.uniqueKey) + "/" },
										span({ class: 'fa fa-search' }, _("Go to"))));
							}
						)
					)
				)]))];
};
