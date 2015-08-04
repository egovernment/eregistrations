// Single document revision view

'use strict';

var _          = require('mano').i18n.bind('Official: Revision')
  , getSubUrl  = require('./utils/_get-sub-url');

module.exports = function (doc) {
	var  user = doc.master;

	return form(
		{ id: 'revision-documento', action: url('revision', getSubUrl(user, doc.uniqueKey)),
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
			li(div({ class: 'input' }, input({ dbjs: doc._approved }))),
			li(
				div({ class: 'official-form-document-revision-reject-reason' },
					field({ dbjs: doc._rejectReason }))
			)
		),
		p(input({ class: 'enviar-btn', type: 'submit', value: _("Save") }))
	);
};
