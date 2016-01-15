// Generic forms user page (Part A)

'use strict';

var generateSections = require('eregistrations/view/components/generate-form-sections');

exports._parent = require('./business-process-data-forms-tabbed');

exports['forms-sections-content'] = function () {

	_if(
		this.section._label,
		[
			h2(this.section._label),
			_if(this.section._legend, div({ class: 'section-primary-legend' },
				md(this.section._legend)))
		]
	);
	generateSections(this.section.applicableSections, { viewContext: this });

};
