// Data view

'use strict';

var normalizeOptions = require('es5-ext/object/normalize-options')
  , _                = require('mano').i18n.bind('View: Component: Data')
  , renderSections   = require('./render-sections-json');

module.exports = function (context/*, options*/) {
	var options         = normalizeOptions(arguments[1])
	  , urlPrefix       = options.urlPrefix || '/'
	  , businessProcess = context.businessProcess;

	return section({ class: 'section-primary' },
		options.prependContent,
		div({ class: 'business-process-submitted-data-print-only' }, ' ',
			a({
				class: 'hint-optional hint-optional-left',
				'data-hint': _("Print your application form"),
				href: '/business-process-data-forms-' + businessProcess.__id__ + '.pdf',
				target: '_blank'
			}, span({ class: 'fa fa-print' }, _("Print")))),
		div({ class: 'document-preview-data business-process-submitted-data' },
			renderSections(businessProcess.dataForms.dataSnapshot)));
};
