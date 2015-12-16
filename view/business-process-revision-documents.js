// Documents list and user data

'use strict';

var camelToHyphen    = require('es5-ext/string/#/camel-to-hyphen')
  , generateSections = require('./components/generate-sections')
  , _                = require('mano').i18n.bind('User Submitted')
  , _d = _;

exports._parent = require('./business-process-revision');
exports._match = 'businessProcess';

exports['official-revision-documents'] = { class: { active: true } };
exports['official-revision-content'] = function () {
	var options = Object(arguments[1])
	  , urlPrefix = options.urlPrefix || '/'
	  , businessProcess = this.businessProcess;

	return [section({ class: 'section-primary' },
		_if(businessProcess.requirementUploads.applicable._size,
			[h4(_("Documents of the petitioner")),
				div(
					ol({ class: 'submitted-documents-list' },
						businessProcess.requirementUploads.applicable,
						function (requirementUpload) {
							li(a({ href: urlPrefix + 'revision/user-id/documents/' +
									camelToHyphen.call(requirementUpload.document.uniqueKey) + "/" },
									_d(requirementUpload.document._label, { user: requirementUpload.master })),
								_if(requirementUpload._isApproved, span({ class: 'fa fa-check' })),
									_if(requirementUpload._isRejected, span({ class: 'fa fa-exclamation' }))
								);
						}
						)
				),
				div({ id: 'revision-box', class: 'business-process-revision-box hidden' }),
				div({ id: 'document-box', class: 'submitted-preview hidden' },
					div({ id: 'document-preview', class: 'submitted-preview-document' }),
					div({ class: 'submitted-preview-user-data  entity-data-section-side' },
						generateSections(businessProcess.dataForms.applicable, { viewContext: this })
						)
					)
				]
			)
		)];
};
