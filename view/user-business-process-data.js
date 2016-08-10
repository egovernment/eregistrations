// User: Form sections data for chosen business process

'use strict';

var _              = require('mano').i18n.bind("View: User")
  , renderSections = require('./components/render-sections-json');

exports._parent = require('./user-base');
exports._match = 'businessProcess';

exports['sub-main'] = {
	content: function () {
		var businessProcess = this.businessProcess;

		div({ class: "content user-forms" },
			h2({ class: "container-with-nav" },
				_("Data of ${businessName}",
					{ businessName: businessProcess._businessName }),
				a({ class: "hint-optional hint-optional-left",
					'data-hint': _("Print your application form"), target: '_blank',
					href: mmap(businessProcess.dataForms._lastEditStamp, function (lastEditStamp) {
						return '/business-process-data-forms-' + businessProcess.__id__ +
							'.pdf?' + lastEditStamp;
					})
					}, span({ class: "fa fa-print" }, _("Print")))),
			div({ class: 'section-primary' },
				div({ class: 'document-preview-data business-process-submitted-data' },
					renderSections(businessProcess.dataForms.dataSnapshot))));
	}
};
