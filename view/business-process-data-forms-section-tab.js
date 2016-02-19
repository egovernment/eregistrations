// Generic forms user page (Part A)

'use strict';

var generateSections = require('eregistrations/view/components/generate-form-sections')
, _                 = require('mano').i18n.bind('Registration');

exports._parent = require('./business-process-data-forms-tabbed');

exports['forms-sections-content'] = function () {
	insert(
		_if(this.section._legend, div({ class: 'info-main' },
			md(this.section._legend))),
		generateSections(this.section.applicableSections, { viewContext: this }),
		p({ class: 'user-next-step-button' },
			a({ href: this.section._nextSection.map(function (nextSection) {
				if (!nextSection) return '/documents/';
				return '/forms/' + nextSection.pageUrl + '/';
			})
				}, _('Continue to next step')))
	);

};

exports._match = 'section';
