// Business Process Submitted data view

'use strict';

var _                = require('mano').i18n.bind('View: Submitted')
  , generateSections = require('./components/generate-sections');

exports._parent = require('./business-process-submitted');

exports['tab-business-process-data'] = { class: { active: true } };
exports['tab-content'] = function (/*options*/) {
	var businessProcess = this.businessProcess;

	section(
		{ class: 'section-primary' },
		div(
			{ class: 'container-with-nav' },
			a(
				{ class: 'hint-optional hint-optional-left',
					'data-hint': _("Print your application form"), href: '/data-print/',
					target: '_blank' },
				span({ class: 'fa fa-print' }, _("Print"))
			)
		),
		div(
			{ class: 'business-process-revision-selected-document' },
			div(
				{ class: 'entity-data-section-side' },
				generateSections(businessProcess.dataForms.applicable, { viewContext: this })
			)
		)
	);
};
