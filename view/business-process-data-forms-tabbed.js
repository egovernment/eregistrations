// Generic forms user page (Part A)

'use strict';

var errorMsg     = require('./components/business-process-error-info').errorMsg
  , infoMsg      = require('./components/business-process-optional-info').infoMsg
  , formsHeading = require('./components/business-process-data-forms-heading');

exports._parent = require('./business-process-base');

exports.step = {
	class: { content: false, 'user-forms': false },
	content: function () {
		exports._formsHeading.call(this);
		nav({ class: 'forms-tab-nav' },
			div({ class: 'content' }, errorMsg(this)),
			div({ class: 'content' }, infoMsg(this)),
			div({ class: 'content' }, exports._optionalInfo.call(this)),
			ul({ class: 'content' }, exports._tabs.call(this)));
		div({ id: 'forms-sections-content', class: 'content user-forms forms-tab-content' });
	}
};

exports._tabs = function () {
	return list(this.businessProcess.dataForms.applicable, function (section) {
		var sectionTabAddress, rootUrl;
		rootUrl           = exports._rootUrl.call(this);
		sectionTabAddress = section.pageUrl ? (rootUrl + section.pageUrl + '/') : rootUrl;

		return li({ id: 'tab-item-' + section.domId, class: 'forms-tab-nav-tab' },
			a({ href: sectionTabAddress },
				span(i({ class: ['forms-tab-nav-tab-status fa',
						_if(eq(section._status, 1), 'fa-check', 'fa-star')] }),
					section._shortLabel)));
	});
};

exports._rootUrl = function () {
	return '/forms/';
};

exports._formsHeading = formsHeading;

// Displayed together with error info and 'global' optional info
exports._optionalInfo = Function.prototype;
