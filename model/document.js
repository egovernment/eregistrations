// Abstract document class
// Each specific document class extends this one

'use strict';

var memoize               = require('memoizee/plain')
  , defineDate            = require('dbjs-ext/date-time/date')
  , defineStringLine      = require('dbjs-ext/string/string-line')
  , _                     = require('mano').i18n.bind('Model: Documents')
  , defineFile            = require('./file')
  , defineStatusLog       = require('./lib/status-log')
  , defineFormSectionBase = require('./form-section-base');

module.exports = memoize(function (db) {
	var StringLine = defineStringLine(db)
	  , File       = defineFile(db)
	  , DateType   = defineDate(db)
	  , StatusLog  = defineStatusLog(db)
	  , FormSectionBase = defineFormSectionBase(db);

	db.Object.extend('Document', {
		// Document label, fallbacks to label as decided on constructor
		label: { type: StringLine, value: function () { return this.constructor.label; } },
		// Document legend, fallbacks to legend as decided on constructor
		legend: { type: StringLine, value: function () { return this.constructor.legend; } },
		// Resolves unique named id (in camelCase), that's usually used to resolve human readable urls.
		// e.g. if uniqueKey would be 'authorizedAlocoholLicence' then url token leading to document
		// (converted via es5-ext/string/#/camel-to-hyphen) would 'authorized-alcohol-licence'
		uniqueKey: { type: StringLine, value: function () { return this.key; } },
		// Which entity issued the document. In case of certificates it's an issuing institution,
		// in case of user uploads, it's a user that uploaded files (and that's the default)
		issuedBy: { type: db.Object, value: function () { return this.master.user; } },
		// Issue date. It's inputted by hand official issuance date
		issueDate: { type: DateType, required: true, label: _("Date of issuance") },
		// Document fields sections
		// It's about fields we want officials to fill either at revision (document upload) or
		// processing step (certificate upload)
		dataForm: { type: FormSectionBase, nested: true },
		// Map of uploaded files
		// This property should be used *only* to generate form controls
		// For "read" uses, always refer to "orderedFiles"
		files: { type: db.Object, nested: true },
		// Ordered (by upload date) list of files
		// Normally 'files' should provide that, but due to limitation of dbjs
		// we need a property that assures order and filters all cleared files
		orderedFiles: { type: File, multiple: true, value: function (_observe) {
			var files = [];
			_observe(this.files, true).forEach(function (file) {
				if (!_observe(file._path)) return;
				files.push(file);
			});
			return files.sort(function (a, b) {
				return a.getDescriptor('name')._lastOwnModified_ -
					b.getDescriptor('name')._lastOwnModified_;
			});
		} },
		// History of document processing
		statusLog: { type: StatusLog, multiple: true }
	}, {
		// Document label
		label: { type: StringLine },
		// Document legend
		legend: { type: StringLine },
		// Document abbrevation
		abbr: { type: StringLine }
	});

	// Below defines characteristics for each property on document.files map
	db.Document.prototype.files._descriptorPrototype_.setProperties({
		type: File,
		nested: true
	});

	return db.Document;
}, { normalizer: require('memoizee/normalizers/get-1')() });
