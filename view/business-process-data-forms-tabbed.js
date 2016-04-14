// Generic forms user page (Part A)

'use strict';

var appLocation          = require('mano/lib/client/location')
  , disableConditionally = require('./components/disable-conditionally')
  , errorMsg             = require('./_business-process-error-info').errorMsg
  , infoMsg              = require('./_business-process-optional-info').infoMsg;

exports._parent = require('./business-process-base');

exports['step-guide'] = { class: { 'step-form': true } };

exports.step = {
	class: { content: false, 'user-forms': false },
	content: function () {
		var businessProcess = this.businessProcess
		  , guideProgress   = businessProcess._guideProgress;

		nav({ class: 'forms-tab-nav' },
			div({ class: 'content' }, errorMsg(this)),
			div({ class: 'content' }, infoMsg(this)),
			div({ class: 'content' }, exports._optionalInfo(this)),
			ul({ class: 'content' }, exports._tabs(this)));

		insert(disableConditionally(
			div({ id: 'forms-sections-content', class: 'content user-forms forms-tab-content' }),
			not(eq(guideProgress, 1)),
			{
				forcedState: exports._forcedState(this),
				id: 'forms-disabler-range'
			}
		));
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
				section._shortLabel)));
	});
};

// Resolves forced disabler state of the forms
exports._forcedState = Function.prototype;

// Displayed together with error info and 'global' optional info
exports._optionalInfo = Function.prototype;
