// Documents list and user data

'use strict';

var renderDocumentsList = require('./_business-process-draw-document-list')
  , renderCertificateList =  require('./_business-process-draw-certificate-list');

exports._parent = require('./business-process-revision');
exports._match = 'businessProcess';

exports['business-process-documents'] = { class: { active: true } };
exports['official-revision-content'] = function (/*options*/) {
	var options = Object(arguments[1])
	  , urlPrefix = options.urlPrefix || '/'
	  , businessProcess = this.businessProcess
	  , selectedDocumentId = this.document ?  this.document.__id__ : null;

	return [section({ class: 'section-primary' },
			renderDocumentsList(businessProcess, urlPrefix, selectedDocumentId),
			renderCertificateList(businessProcess, urlPrefix, selectedDocumentId),
			div({ id: 'revision-document', class: 'business-process-revision-selected-document' })
		)];
};
