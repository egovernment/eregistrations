// Data view

'use strict';

var normalizeOptions = require('es5-ext/object/normalize-options')
  , _                = require('mano').i18n.bind('View: Component: Documents')
  , renderSections   = require('./render-sections-json');

module.exports = function (context/*, options*/) {
	var options   = normalizeOptions(arguments[1])
	  , urlPrefix = options.urlPrefix || '/';

	return section({ class: 'section-primary' },
		div({ class: 'business-submitted-data-print-only' }, ' ',
			a({ class: 'hint-optional hint-optional-left',
				'data-hint': _("Print your application form"), href: urlPrefix + 'data-print/',
				target: '_blank' },
				span({ class: 'fa fa-print' }, _("Print")))),
		div({ class: 'business-process-revision-selected-document' },
			div({ class: 'entity-data-section-side' },
				renderSections(context.businessProcess.dataForms.dataSnapshot))));
};
