'use strict';

var ensureString     = require('es5-ext/object/validate-stringifiable-value')
  , ensureObject     = require('es5-ext/object/valid-object')
  , ensureCallable   = require('es5-ext/object/valid-callable')
  , normalizeOptions = require('es5-ext/object/normalize-options')
  , ensureDatabase   = require('dbjs/valid-dbjs')
  , resolve          = require('path').resolve
  , encode           = require('ent').encode
  , defineResolved   = require('../../../../view/dbjs/data-snapshot-resolved')
  , renderSections   = require('../../../../apps-common/pdf-templates/render-sections-html')
  , toDateInTimeZone = require('../../../../utils/to-date-in-time-zone')
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
		delete options.renderer;

		return renderer(businessProcess, filePath, options);
	};
};

exports.defaultRenderer = function (businessProcess, filePath/* options*/) {
	var options          = normalizeOptions(arguments[2]), dataSnapshot;

	if (businessProcess.isAtDraft) {
		dataSnapshot = businessProcess.dataForms.toJSON();
	} else {
		dataSnapshot = businessProcess.dataForms.dataSnapshot.resolved;
	}

	return htmlToPdf(templatePath, filePath, {
		width: "210mm",
		height: "297mm",
		templateInserts: {
			inserts: {
				locale:           businessProcess.database.locale,
				currentDate:      toDateInTimeZone(new Date(), businessProcess.database.timeZone),
				businessName:     encode(businessProcess.stringifyPropertyValue('businessName')),
				logo:             options.logo,
				disableSigning:   options.disableSigning,
				swornDeclaration: options.swornDeclaration
			},
			sections: renderSections(dataSnapshot)
		}
	});
};
