// Single document revision view

'use strict';

var _              = require('mano').i18n.bind('Official: Revision')
  , camelToHyphen  = require('es5-ext/string/#/camel-to-hyphen')
  , renderDocument = require('./_business-process-revision-document')

  , revisionForm;

exports._parent = require('./business-process-revision-documents');
exports._match = 'document';

revisionForm = function (requirementUpload) {
	var revFail, revFailOther, revFailInput;
	return form(
		{ id: 'form-revision-requirement-upload',
			action: '/revision-requirement-upload/' + requirementUpload.master.__id__ +
				'/' + camelToHyphen.call(requirementUpload.document.uniqueKey) + '/',
			method: 'post', class: 'submitted-preview-form' },
		div({ class: 'business-process-revision-box-header' },
			ol({ class: 'submitted-documents-list' },
				li(requirementUpload.document._label)),
			div({ class: 'business-process-revision-box-controls' },
				a({ href: '#', class: 'hint-optional hint-optional-left',
					'data-hint': _('Previous document') },
					i({ class: 'fa fa-angle-left' })),
				a({ href: '#', class: 'hint-optional hint-optional-left', 'data-hint': _('Next document') },
					i({ class: 'fa fa-angle-right' }))
				)),
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
			),
			li(input({ type: 'submit', value: _("Save") }))
		),
		legacy('radioMatch', 'form-revision-requirement-upload',
			requirementUpload.__id__ + '/status', { invalid: revFail.getId() }),
		legacy('checkboxToggle', normalize(revFailInput.itemsByValue.other.dom).getId(),
				revFailOther.getId())
	);
};

exports['revision-box'] = { class: { hidden: false } };
exports['document-box'] = { class: { hidden: false } };

exports['document-preview'] = function () {
	renderDocument(this.document);
};

exports['revision-box'] = function () {
	revisionForm(this.document.owner);
};
