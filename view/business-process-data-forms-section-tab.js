// Generic forms user page (Part A)

'use strict';

var generateSections = require('eregistrations/view/components/generate-form-sections')
  , progressRules    = require('./components/progress-rules')
  , _                = require('mano').i18n.bind('Registration');

exports._parent = require('./business-process-data-forms-tabbed');

exports['forms-sections-content'] = function () {
	insert(
		_if(this.section._legend, div({ class: 'info-main' },
			md(this.section._legend))),
		disabler(
			exports._disableCondition(this),
			this.section.applicableSections ?
					[progressRules(this.section),
						generateSections(this.section.applicableSections, { viewContext: this })] :
					this.section.toDOMForm(document)
		),
		exports._nextSectionNav(this)
	);
};

exports._disableCondition = function (context) {
	return not(eq(context.businessProcess._guideProgress, 1));
};

exports._nextSectionNav = function (context) {
	return p({ class: 'user-next-step-button' },
		a({ href: context.section._nextSection.map(function (nextSection) {
			if (!nextSection) return '/documents/';
			return '/forms/' + nextSection.pageUrl + '/';
		}) }, _('Continue to next step')));
};

exports._match = 'section';
