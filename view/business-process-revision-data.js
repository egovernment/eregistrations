// Official Revision data view

'use strict';

var _           = require('mano').i18n.bind('View: Official: Revision')
  , dataView    = require('./components/business-process-data')
  , disableStep = require('./components/disable-processing-step')
  , revisionForm;

exports._parent = require('./business-process-revision');

revisionForm = function (processingStep) {
	var businessProcess = processingStep.master
	  , revReason;

	return form(
		{
			id: 'form-revision-data-forms',
			class: ['submitted-preview-form',
				_if(eq(processingStep.dataFormsRevision._progress, 1), 'completed')],
			method: 'post',
			action: '/revision-data-forms/' + businessProcess.__id__ + '/'
		},
		ul(
			{ class: 'form-elements' },
			li(div({ class: 'input' }, input({ dbjs: businessProcess.dataForms._status }))),
			li(
				revReason = div({ class: 'official-form-data-forms-revision-reject-reason' },
					field({ dbjs: businessProcess.dataForms._rejectReason }))
			),
			li(input({ type: 'submit', value: _("Save") }))
		),
		legacy('radioMatch', 'form-revision-data-forms',
				businessProcess.dataForms.__id__ + '/status', { rejected: revReason.getId() })
	);
};

exports['tab-business-process-data'] = { class: { active: true } };
exports['tab-content'] = function () {
	var businessProcess = this.businessProcess
	  , processingStep  = this.processingStep;

	insert(dataView(this, {
		prependContent:
			_if(processingStep.dataFormsRevision._isProcessable,
				div({ class: 'document-preview-box' },
					disableStep(processingStep, revisionForm(processingStep)))),
		urlPrefix: '/' + businessProcess.__id__ + '/'
	}));
};
