// Single document revision view

'use strict';

var camelToHyphen              = require('es5-ext/string/#/camel-to-hyphen')
  , _                          = require('mano').i18n.bind('View: Official: Revision')
  , renderDocument             = require('./components/document-preview')
  , renderDocumentHistory      = require('./components/business-process-document-history')
  , renderDocumentRevisionInfo = require('./components/business-process-document-review-info')
  , renderSections             = require('./components/render-sections-json')
  , disableStep                = require('./components/disable-processing-step')
  , getDocumentData            = require('./utils/get-document-data')

  , revisionForm;

exports._parent  = require('./business-process-revision-documents');
exports._dynamic = require('./utils/document-dynamic-matcher')('document');
exports._match = 'documentUniqueId';

revisionForm = function (requirementUpload) {
	var revFail, revFailOther, revFailInput;

	return form({
		id: 'form-revision-requirement-upload',
		class: 'submitted-preview-form',
		method: 'post',
		action: '/revision-requirement-upload/' + requirementUpload.master.__id__ +
			'/' + camelToHyphen.call(requirementUpload.document.uniqueKey) + '/'
	}, ul({ class: 'form-elements' },
			li(div({ class: 'input' }, input({ dbjs: requirementUpload._status }))),
			li(revFail = div({ class: 'input' },
				revFailInput = input({ dbjs: requirementUpload._rejectReasonTypes, type: 'checkbox' })
				._dbjsInput)),
			li(revFailOther = div({ class: 'input' },
				input({ dbjs: requirementUpload._rejectReasonMemo }))),
			li(input({ type: 'submit', value: _("Save") }))),
		legacy('radioMatch', 'form-revision-requirement-upload',
			requirementUpload.__id__ + '/status', { invalid: revFail.getId() }),
		legacy('checkboxToggle', normalize(revFailInput.itemsByValue.other.dom).getId(),
			revFailOther.getId()));
};

exports['selection-preview'] = function () {
	var documentData = getDocumentData(this), isProcessable;

	if (this.document) {
		isProcessable  = this.processingStep.requirementUploads.processable._has(this.document.owner);
	}

	insert(
		renderDocument(this, documentData, {
			prependContent: _if(isProcessable, function () {
				return disableStep(this.processingStep, revisionForm(this.document.owner));
			}.bind(this), function () {
				return renderDocumentRevisionInfo(this);
			}.bind(this)),
			mainContent: exports._documentPreviewContent.call(this, documentData),
			sideContent: renderSections(this.businessProcess.dataForms.dataSnapshot),
			urlPrefix: '/' + this.businessProcess.__id__ + '/',
			documentsRootHref: '/' + this.businessProcess.__id__ + '/'
		}),
		renderDocumentHistory(documentData)
	);
};

exports._documentPreviewContent = Function.prototype;
