// Generic forms user page (Part A)

'use strict';

exports._parent = require('./business-process-base');

exports['step-guide'] = { class: { 'step-form': true } };

exports.step = function () {
	section({ class: 'forms-tab-nav' },
		exports._formstabs(this));
	div({ id: 'forms-sections-content' });

};

exports._formstabs = function (context) {
	context.businessProcess.dataForms.applicable.forEach(function (section) {
		return a({ href: "/forms/" + section.label.replace(/ /g, '').toLowerCase(), class: 'tab' },
			section._label);
	});
};
