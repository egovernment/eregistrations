// Official data view

'use strict';

var _                = require('mano').i18n.bind('View: Official')
  , generateSections = require('./components/generate-sections');

exports._parent = require('./business-process-official');

exports['tab-business-process-data'] = { class: { active: true } };
exports['tab-content'] = function () {
	var businessProcess = this.businessProcess
	  , urlPrefix       = '/' + this.businessProcess.__id__ + '/';

	section(
		{ class: 'section-primary' },
		div(
			{ class: 'container-with-nav' },
			a(
				{ class: 'hint-optional hint-optional-left',
					'data-hint': _("Print your application form"), href: urlPrefix + 'data-print/',
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
