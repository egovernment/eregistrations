// Single document revision view

'use strict';

var document = require('./_document'),
revisionControle
, _ = require('mano').i18n.bind('Official: Revision')
, camelToHyphen = require('es5-ext/string/#/camel-to-hyphen');

exports._parent = require('./user-base');
exports._match = 'document';

revisionControle = function (requirementUpload) {
	var revFail, revFailOther;
	return form(
		{ id: 'form-revision-requirement-upload',
			action: '/revision-requirement-upload/' + requirementUpload.__id__ +
				'/' + camelToHyphen.call(requirementUpload.document.uniqueKey) + '/',
			method: 'post', class: 'submitted-preview-form' },
		ul(
			{ class: 'form-elements' },
			li(div({ class: 'input' },
				_if(requirementUpload._correspondingCost, function () {
					return label({ class: 'input-aside' },
						input({ dbjs: requirementUpload.correspondingCost._isPaid, type: 'checkbox' }), " ",
						span(requirementUpload.correspondingCost.receiptLabel, ": ",
							requirementUpload.correspondingCost._amount));
				})
				)),
			li(div({ class: 'input' }, input({ dbjs: requirementUpload._status }))),
			li(
				revFail = div({ class: 'input' },
					input({ dbjs: requirementUpload._rejectReasonTypes, type: 'checkbox' }))
			),
			li(
				revFailOther = div({ class: 'official-form-document-revision-reject-reason' },
					field({ dbjs: requirementUpload._rejectReasonMemo }))
			)
		),
		p(input({ type: 'submit', value: _("Save") })),
		legacy('radioMatch', 'form-revision-requirement-upload',
			requirementUpload.__id__ + '/rejectReasonTypes', { other: revFailOther.getId() }),
		legacy('radioMatch', 'form-revision-requirement-upload',
			requirementUpload.__id__ + '/status', { invalid: revFail.getId() })
	);
};

exports['sub-main'] = {
	class: { content: true, 'user-forms': true },
	content: function () {
		document(this.document, revisionControle(this.document.owner));
	}
};
