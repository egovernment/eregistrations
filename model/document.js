// Abstract document class
// Each specific document class extends this one

'use strict';

var memoize               = require('memoizee/plain')
  , defineDate            = require('dbjs-ext/date-time/date')
  , defineStringLine      = require('dbjs-ext/string/string-line')
  , _                     = require('mano').i18n.bind('Model: Documents')
  , defineFile            = require('./file')
  , defineStatusLog       = require('./lib/status-log')
  , defineFormSectionBase = require('./form-section-base')
  , defineNestedMap       = require('./lib/nested-map');

module.exports = memoize(function (db) {
	var StringLine = defineStringLine(db)
	  , File       = defineFile(db)
	  , DateType   = defineDate(db)
	  , StatusLog  = defineStatusLog(db)
	  , FormSectionBase = defineFormSectionBase(db)
	  , Document;

	Document = db.Object.extend('Document', {
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
		// Eventual expiration date
		expirationDate: { type: DateType, label: _("Date of expiration") },
		// Document fields sections
		// It's about fields we want officials to fill either at revision (document upload) or
		// processing step (certificate upload)
		dataForm: { type: FormSectionBase, nested: true },
		// True when a given document is electronic, false otherwise
		isElectronic: { type: db.Boolean, value: false },
		// Document number
		number: { type: StringLine, label: _("Number") },
		// True if this document is used as a certificate
		isCertificate: { type: db.Boolean, value: function (_observe) {
			return this.owner === this.master.certificates.map;
		} },
		// Returns processing ProcessingStep if it exists on a certificate
		processingStep: {
			// Type should be ProcessingStep,
			// Still ProcessingStep invokes circular resolution to Document by using UploadsProcess
			// to avoid circluar requires hell (as Document is low-level type and it's required by
			// many classes), we do not require here ProcessingStep, therefore we can't set it as type.
			// Type of this property is fixed in ProcessingStep definition
			// This hack will be removed after we introduce Certificate type (which will work analogously
			// as RequirementUpload) as then this property will land on Certificate and not Document
			type: db.Object,
			value: function () {
				if (!this.isCertificate) return;
				return this.master.processingSteps.map.processing;
			}
		}
	}, {
		// Document label
		label: { type: StringLine },
		// Document legend
		legend: { type: StringLine },
		// Document abbrevation
		abbr: { type: StringLine }
	});

	defineNestedMap(db);
	// Map of uploaded files
	// Document.prototype.files.map property should be used *only* to generate form controls
	// For "read" uses, always refer to Document.prototype.files.ordered
	Document.prototype.defineNestedMap('files', { itemType: File, cardinalPropertyKey: 'path' });

	// History of document processing
	Document.prototype.defineNestedMap('statusLog',
		{ itemType: StatusLog, cardinalPropertyKey: 'label' });

	return Document;
}, { normalizer: require('memoizee/normalizers/get-1')() });
