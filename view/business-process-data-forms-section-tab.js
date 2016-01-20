// Generic forms user page (Part A)

'use strict';

var generateSections = require('eregistrations/view/components/generate-form-sections');

exports._parent = require('./business-process-data-forms-tabbed');

exports['forms-sections-content'] = function () {
	insert(
		_if(this.section._legend, div({ class: 'info-main' },
			md(this.section._legend))),
		generateSections(this.section.applicableSections, { viewContext: this })
	);

};

exports._match = 'section';
