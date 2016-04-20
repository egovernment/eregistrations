// Abstract document class
// Each specific document class extends this one

'use strict';

var Map                   = require('es6-map')
  , memoize               = require('memoizee/plain')
  , defineDate            = require('dbjs-ext/date-time/date')
  , defineStringLine      = require('dbjs-ext/string/string-line')
  , _                     = require('mano').i18n.bind('Model: Documents')
  , defineFile            = require('./file')
  , defineStatusLog       = require('./lib/status-log')
  , defineFormSectionBase = require('./form-section-base')
  , defineFormSection     = require('./form-section')
  , defineNestedMap       = require('./lib/nested-map')
  , definePerson          = require('./person')
  , defineGetTranslations = require('./lib/define-get-translations');

module.exports = memoize(function (db) {
	var StringLine      = defineStringLine(db)
	  , File            = defineFile(db)
	  , DateType        = defineDate(db)
	  , StatusLog       = defineStatusLog(db)
	  , FormSectionBase = defineFormSectionBase(db)
	  , FormSection     = defineFormSection(db)
	  , Person          = definePerson(db)
	  , Document;

	// Enum for processing step status
	var CertificateStatus = StringLine.createEnum('CertificateStatus', new Map([
		['pending', { label: _("Pending") }],
		['rejected', { label: _("Rejected") }],
		['approved', { label: _("Approved") }]
	]));

	Document = db.Object.extend('Document', {
		// Document label, fallbacks to label as decided on constructor
		label: { type: StringLine, value: function () { return this.constructor.label; } },
		// Document legend, fallbacks to legend as decided on constructor
		legend: { type: StringLine, value: function () { return this.constructor.legend; } },
		// Which entity issued the document. In case of certificates it's an issuing institution,
		// in case of user uploads, it's a user that uploaded files (and that's the default)
		issuedBy: {
			type: db.Object,
			label: _("Emissor institution")
		},
		// Issue date. It's inputted by hand official issuance date
		issueDate: { type: DateType, required: true, label: _("Date of issuance") },
		// Eventual expiration date
		expirationDate: { type: DateType, label: _("Date of expiration") },
		// True when a given document is electronic, false otherwise
		isElectronic: { type: db.Boolean, value: false },
		// Document number
		number: { type: StringLine, label: _("Number") },

		// Below properties are to be moved to Certificate class when it will be introduced
		//
		// Resolves unique named id (in camelCase), that's usually used to resolve human readable urls.
		// e.g. if uniqueKey would be 'authorizedAlocoholLicence' then url token leading to document
		// (converted via es5-ext/string/#/camel-to-hyphen) would 'authorized-alcohol-licence'
		uniqueKey: { type: StringLine, value: function () { return this.key; } },
		issuedByOfficer: {
			type: Person,
			value: function () {
				if (!this.processingStep) return;
				return this.processingStep.processor;
			},
			label: _("Emissor officer")
		},
		registration: {
			type: db.Object,
			value: function () {
				var res;
				this.master.registrations.applicable.some(function (reg) {
					if (reg.certificates.has(this)) {
						res = reg;
						return true;
					}
				}, this);

				return res;
			},
			label: _("Related Inscription")
		},
		// Document fields sections
		// It's about fields we want officials to fill either at revision (document upload) or
		// processing step (certificate upload)
		dataForm: { type: FormSectionBase, nested: true },
		overviewSection: { type: FormSection, nested: true },
		// True if this document is used as a certificate
		isCertificate: { type: db.Boolean, value: function (_observe) {
			return this.owner === this.master.certificates.map;
		} },
		// True if this document is a certificate that is supposed to be handed over at front desk
		isToBeHanded: { type: db.Boolean, value: false },
		// Whether certificate was handed over (at front desk)
		wasHanded: { type: db.Boolean },
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
		},
		// Status of certificate
		status: { type: CertificateStatus, value: function () {
			if (this.master.isApproved) return 'approved';
			if (this.master.isRejected) return 'rejected';
			if (this.processingStep.status === 'approved') return 'approved';
			if (this.processingStep.status) return 'pending';
		} },
		toJSON: { value: function (ignore) {
			var data = {
				uniqueKey: this.key,
				label: this.database.resolveTemplate(this.label, this.getTranslations(), { partial: true }),
				issuedBy: this.getOwnDescriptor('issuedBy').valueTOJSON(),
				issuedDate: this.getOwnDescriptor('issueDate').valueTOJSON(),
				number: this.getOwnDescriptor('issueDate').valueTOJSON(),
				overviewSection: this.owerviewSection.toJSON()
			};
			if (this.master.isApproved) data.status = 'approved';
			else if (this.master.isRejected) data.status = 'rejected';
			var files = [];
			this.files.ordered.forEach(function (file) { files.push(file.toJSON()); });
			if (files.length) data.files = files;
			if (this.dataForm.constructor !== this.database.FormSectionBase) {
				data.section = this.dataForm.toJSON();
				// Strip `files/map` property, we don't want it in overview
				(function self(data) {
					if (data.fields) {
						data.fields = data.fields.filter(function (field) {
							return !field.id.match(/\/files\/map$/);
						});
					}
					if (data.sections) data.sections.forEach(self);
				}(data.section));
			}
			return data;
		} }
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

	Document.prototype.overviewSection.setProperties({
		label: _("Emission data"),
		propertyMasterType: Document,
		propertyNames: ['issuedBy', 'issuedByOfficer', 'registration']
	});

	defineGetTranslations(Document.prototype);

	return Document;
}, { normalizer: require('memoizee/normalizers/get-1')() });
