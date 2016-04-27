// User: Form sections data for chosen business process

'use strict';

var _                = require('mano').i18n.bind("View: User")
  , generateSections = require('./components/generate-sections');

exports._parent = require('./user-base');
exports._match = 'businessProcess';

exports['sub-main'] = {
	content: function () {
		var cumulatedSections;
		cumulatedSections = this.businessProcess.dataForms.processChainApplicable;
		div({ class: "content user-forms" },
			h2({ class: "container-with-nav" },
				_("Data of ${businessName}",
					{ businessName: this.businessProcess._businessName }),
				a({ class: "hint-optional hint-optional-left",
					'data-hint': _("Print your application form"), target: '_blank',
					href: '/business-process/' + this.businessProcess.__id__ + '/print-data/'
					}, span({ class: "fa fa-print" }, _("Print")))),
			_if(cumulatedSections._size,
				div({ class: 'section-primary entity-data-section-side' },
					generateSections(cumulatedSections, { viewContext: this })),
				div({ class: 'section-primary' },
					p(_('No data to display'))))
			);
	}
};
