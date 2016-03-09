// Documents list and user data

'use strict';

var camelToHyphen    = require('es5-ext/string/#/camel-to-hyphen')
  , generateSections = require('./components/generate-sections')
  , renderDocumentsList = require('./_business-process-draw-document-list')
  , _                = require('mano').i18n.bind('User Submitted')
  , _d = _;

exports._parent = require('./business-process-revision');
exports._match = 'businessProcess';

exports['business-process-documents'] = { class: { active: true } };
exports['official-revision-content'] = function (/*options*/) {
	var options = Object(arguments[1])
	  , urlPrefix = options.urlPrefix || '/'
	  , businessProcess = this.businessProcess;

	return [section({ class: 'section-primary' },
			renderDocumentsList(businessProcess, urlPrefix)
		)];
};
