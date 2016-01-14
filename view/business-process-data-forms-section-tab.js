// Generic forms user page (Part A)

'use strict';

var generateSections  = require('./components/generate-form-sections')
  , errorMsg          = require('./_business-process-error-info').errorMsg;

exports._parent = require('./business-process-base');

exports['step-guide'] = { class: { 'step-form': true } };

exports.step = function () {

	insert(errorMsg(this));

	div({ class: ['disabler-range', _if(not(eq(this.businessProcess._guideProgress, 1)),
				'disabler-active')], id: 'forms-disabler-range' },
		div({ class: 'disabler' }),
		exports._forms(this));

};

exports._forms = function (context) {
	return generateSections(context.businessProcess.dataForms.applicable, { viewContext: context });
};
