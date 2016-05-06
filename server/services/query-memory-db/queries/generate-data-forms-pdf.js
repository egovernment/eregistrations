'use strict';

var ensureString     = require('es5-ext/object/validate-stringifiable-value')
  , ensureObject     = require('es5-ext/object/valid-object')
  , ensureCallable   = require('es5-ext/object/valid-callable')
  , normalizeOptions = require('es5-ext/object/normalize-options')
  , defineResolved   = require('../../../../model/lib/data-snapshot/resolved')
  , ensureDatabase   = require('dbjs/valid-dbjs')
  , resolve          = require('path').resolve
  , renderSections   = require('../../../utils/render-sections-html')
  , htmlToPdf        = require('../../../html-to-pdf')
  , root             = resolve(__dirname, '../../../..')
  , templatePath     = resolve(root, 'apps-common/pdf-templates/data-forms.html');

module.exports = exports = function (db/*, options*/) {
	var options  = normalizeOptions(arguments[1])
	  , renderer = options.renderer || exports.defaultRenderer;

	ensureDatabase(db);
	ensureCallable(renderer);

	defineResolved(db);

	return function (query) {
		var businessProcessId = ensureString(ensureObject(query).businessProcessId)
		  , filePath          = ensureString(query.filePath)
		  , businessProcess   = db.BusinessProcessBase.getById(businessProcessId);

		if (!businessProcess) return false;

		return renderer(businessProcess, filePath);
	};
};

exports.defaultRenderer = function (businessProcess, filePath) {
	var dataSnapshot = !businessProcess.isAtDraft && businessProcess.dataForms.dataSnapshot;

	if (!dataSnapshot) dataSnapshot = businessProcess.dataForms.toJSON();

	return htmlToPdf(templatePath, filePath, {
		width: "210mm",
		height: "170mm",
		templateInserts: {
			locale: businessProcess.database.locale,
			sections: renderSections(businessProcess.dataForms.dataSnapshot)
		}
	});
};
