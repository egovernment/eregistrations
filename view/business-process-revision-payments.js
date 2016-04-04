// Payments list and user data

'use strict';

var renderPaymentList = require('./_business-process-payments-list');

exports._parent = require('./business-process-revision');
exports._match = 'businessProcess';

exports['business-process-payments'] = { class: { active: true } };
exports['official-revision-content'] = function (/*options*/) {
	var options = Object(arguments[1])
	  , urlPrefix = options.urlPrefix || '/'
	  , businessProcess = this.businessProcess
	  , selectedDocumentId = this.document ?  this.document.__id__ : null;

	return [section({ class: 'section-primary' },
			renderPaymentList(businessProcess, urlPrefix, selectedDocumentId),
			div({ id: 'revision-document', class: 'business-process-revision-selected-document' }))];
};
