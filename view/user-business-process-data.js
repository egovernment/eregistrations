// User: Form sections data for chosen business process

'use strict';

var _              = require('mano').i18n.bind("View: business data")
  , renderSections = require('./components/render-sections-json');

exports._parent = require('./user-base');
exports._match = 'businessProcess';

exports['sub-main'] = {
	content: function () {
		div({ class: "content user-forms" },
			h2({ class: "container-with-nav" },
				_("Data of ${businessName}",
					{ businessName: this.businessProcess._businessName }),
				a({ class: "hint-optional hint-optional-left",
					'data-hint': _("Print your application form"), target: '_blank',
					href: '/business-process-data-forms-' + this.businessProcess.__id__ + '.pdf'
					}, span({ class: "fa fa-print" }, _("Print")))),
			div({ class: 'section-primary entity-data-section-side' },
				renderSections(this.businessProcess.dataForms.dataSnapshot)));
	}
};
