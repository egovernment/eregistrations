// Generic forms user page (Part A)

'use strict';

var appLocation  = require('mano/lib/client/location')
  , errorMsg     = require('./components/business-process-error-info').errorMsg
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
		var sectionTabAddress = exports._routeUrl(section);

		return li({ class: ['forms-tab-nav-tab',
			_if(eq(appLocation._pathname, sectionTabAddress),
					'forms-tab-nav-tab-active')] }, a({ href: sectionTabAddress },
			span(i({ class: ['forms-tab-nav-tab-status fa',
				_if(eq(section._status, 1), 'fa-check', 'fa-star')] }),
				section._shortLabel)));
	});
};

exports._routeUrl = function (section) {
	return section.pageUrl ? ('/forms/' + section.pageUrl + '/') : '/forms/';
};

exports._formsHeading = formsHeading;

// Displayed together with error info and 'global' optional info
exports._optionalInfo = Function.prototype;
