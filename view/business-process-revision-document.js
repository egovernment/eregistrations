// Single document revision view

'use strict';

var _              = require('mano').i18n.bind('Official: Revision')
  , camelToHyphen  = require('es5-ext/string/#/camel-to-hyphen')
  , renderDocument = require('./_business-process-document')
  , disableStep    = require('./components/disable-processing-step')

  , revisionForm;

exports._parent = require('./user-base');
exports._match = 'document';

revisionForm = function (requirementUpload) {
	var revFail, revFailOther, revFailInput;
	return form(
		{ id: 'form-revision-requirement-upload',
			action: '/revision-requirement-upload/' + requirementUpload.master.__id__ +
				'/' + camelToHyphen.call(requirementUpload.document.uniqueKey) + '/',
			method: 'post', class: 'submitted-preview-form' },
		ul(
			{ class: 'form-elements' },
			li(div({ class: 'input' }, input({ dbjs: requirementUpload._status }))),
			li(
				revFail = div({ class: 'input' },
					revFailInput = input({ dbjs: requirementUpload._rejectReasonTypes, type: 'checkbox' })
						._dbjsInput)
			),
			li(
				revFailOther = div({ class: 'official-form-document-revision-reject-reason' },
					field({ dbjs: requirementUpload._rejectReasonMemo }))
			)
		),
		p(input({ type: 'submit', value: _("Save") })),
		legacy('radioMatch', 'form-revision-requirement-upload',
			requirementUpload.__id__ + '/status', { invalid: revFail.getId() }),
		legacy('checkboxToggle', normalize(revFailInput.itemsByValue.other.dom).getId(),
				revFailOther.getId())
	);
};

exports['sub-main'] = {
	class: { content: true, 'user-forms': true },
	content: function () {
		insert(renderDocument(this,
			_if(this.processingStep.requirementUploads.processable._has(this.document.owner),
				disableStep(this.processingStep, revisionForm(this.document.owner)))));
	}
};
