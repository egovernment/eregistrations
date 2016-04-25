// Generic forms user page (Part A)

'use strict';

var _                = require('mano').i18n.bind('Registration')
  , generateSections = require('./components/generate-form-sections')
  , progressRules    = require('./components/progress-rules');

exports._parent = require('./business-process-data-forms-tabbed');

exports['forms-sections-content'] = function () {
	var nextPageLink = this.section._nextSection.map(function (nextSection) {
		if (!nextSection) return exports._nextSectionUrl(this);
		return '/forms/' + nextSection.pageUrl + '/';
	}.bind(this));

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
		_if(and(nextPageLink, eq(this.section._status, 1)), p({ class: 'user-next-step-button' },
			a({ href: nextPageLink }, _('Continue to next step'))))
	);
};

exports._disableCondition = function (context) {
	return not(eq(context.businessProcess._guideProgress, 1));
};

exports._nextSectionUrl = function (context) { return '/documents/'; };

exports._match = 'section';
