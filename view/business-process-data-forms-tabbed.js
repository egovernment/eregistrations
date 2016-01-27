// Generic forms user page (Part A)

'use strict';

var appLocation = require('mano/lib/client/location')
  , errorMsg    = require('./_business-process-error-info').errorMsg;

exports._parent = require('./business-process-base');

exports['step-guide'] = { class: { 'step-form': true } };

exports.step = {
	class: { content: false, 'user-forms': false },
	content: function () {
		insert(errorMsg(this));
		nav({ class: 'forms-tab-nav' },
			ul({ class: 'content' }, exports._tabs(this)));
		div({ id: 'forms-sections-content', class: 'content user-forms forms-tab-content' });
	}
};

exports._tabs = function (context) {
	return list(context.businessProcess.dataForms.applicable, function (section) {
		var sectionTabAddress = section.pageUrl ? ('/forms/' + section.pageUrl + '/') : '/forms/';

		return li({ class: ['forms-tab-nav-tab',
			_if(eq(appLocation._pathname, sectionTabAddress),
					'forms-tab-nav-tab-active')] }, a({ href: sectionTabAddress },
			span(i({ class: ['forms-tab-nav-tab-status fa',
				_if(eq(section._status, 1), 'fa-check', 'fa-star')] }),
				section._label)));
	});
};
