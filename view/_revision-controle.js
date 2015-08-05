// Single document revision view

'use strict';

var _          = require('mano').i18n.bind('Official: Revision');

module.exports = function (doc) {
	var revFail;
	return form(
		{ id: 'revision-documento', action: url('revision', ''),
			method: 'post', class: 'submitted-preview-form' },
		ul(
			{ class: 'form-elements' },
			li(div({ class: 'input' },
				_if(doc._correspondingCost, function () {
					return label({ class: 'input-aside' },
						input({ dbjs: doc.correspondingCost._isPaid, type: 'checkbox' }), " ",
						span(doc.correspondingCost.receiptLabel, ": ", doc.correspondingCost._amount));
				})
				)),
			li(div({ class: 'input' }, input({ dbjs: doc._status }))),
			li(
				field({ dbjs: doc._rejectReasonTypes, type: 'checkbox' })
			),
			li(
				revFail = div({ class: 'official-form-document-revision-reject-reason' },
					field({ dbjs: doc._rejectReasonMemo }))
			)
		),
		p(input({ class: 'enviar-btn', type: 'submit', value: _("Save") })),
		legacy('radioMatch', 'revision-documento', doc.__id__ + '/rejectReasonTypes', {
			other: revFail.getId()
		})
	);
};
