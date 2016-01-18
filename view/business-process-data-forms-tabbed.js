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
	return context.businessProcess.dataForms.applicable.map(function (section) {
		return li({ class: ['forms-tab-nav-tab',
			_if(eq(appLocation._pathname, '/forms/' + section.pageUrl + '/'),
					'forms-tab-nav-tab-active')] }, a({ href: "/forms/" + section.pageUrl + '/' },
			section._label));
	});
};
