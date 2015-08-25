'use strict';

var _ = require('mano').i18n.bind("View: business data")
  , generateSections = require('./components/generate-sections');

exports._parent = require('./user-base');

exports['sub-main'] = {
	class: { content: true, 'user-forms': true },
	content: function () {
		var cumulatedSections;
		cumulatedSections = this.businessProcess.dataForms.processChainApplicable;
		div({ class: "content user-forms" },
			h1({ class: "container-with-nav" },
				_("Data of ${businessName}",
					{ businessName: this.businessProcess._businessName }),
				a({ class: "hint-optional hint-optional-left",
					'data-hint': _("Print your application form"), target: '_blank',
					href: "/data-print/" + this.businessProcess.__id__ + "/"
					}, span({ class: "fa fa-print" }, _("Print")))),
			_if(cumulatedSections._size, generateSections(cumulatedSections, {
				cssClass: ["section-primary", "entity-data-section-primary", "entity-data-section"]
			}), p(_('No data to display')))
			);
	}
};
