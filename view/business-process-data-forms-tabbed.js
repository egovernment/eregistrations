// Generic forms user page (Part A)

'use strict';

var appLocation = require('mano/lib/client/location');

exports._parent = require('./business-process-base');

exports['step-guide'] = { class: { 'step-form': true } };

exports.step = function () {
	nav({ class: 'forms-tab-nav' },
		ul(exports._tabs(this)));
	div({ id: 'forms-sections-content', class: 'user-forms' });

};

exports._tabs = function (context) {
	return list(context.businessProcess.dataForms.applicable, function (section) {
		var sectionTabAddress = section.pageUrl ? ('/forms/' + section.pageUrl + '/') : '/forms/';

		return li({ class: ['forms-tab-nav-tab',
			_if(eq(appLocation._pathname, sectionTabAddress),
					'forms-tab-nav-tab-active')] }, a({ href: sectionTabAddress },
			span(i({ class: ['forms-tab-nav-tab-status fa',
				_if(eq(section._status, 1), 'fa-check', 'fa-close')] }),
				section._label)));
	});
};
