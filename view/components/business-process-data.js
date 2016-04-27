// Data view

'use strict';

var _                = require('mano').i18n.bind('View: Component: Documents')
  , normalizeOptions = require('es5-ext/object/normalize-options')
  , generateSections = require('./generate-sections');

module.exports = function (sections/*, options*/) {
	var options   = normalizeOptions(arguments[2])
	  , urlPrefix = options.urlPrefix || '/';

	return section(
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
				generateSections(sections)
			)
		)
	);
};
