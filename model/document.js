// Abstract document class
// Each specific document class extends this one

'use strict';

var Map                     = require('es6-map')
  , memoize                 = require('memoizee/plain')
  , defineDate              = require('dbjs-ext/date-time/date')
  , defineStringLine        = require('dbjs-ext/string/string-line')
  , _                       = require('mano').i18n.bind('Model: Documents')
  , defineFile              = require('./file')
  , defineStatusLog         = require('./lib/status-log')
  , defineFormSectionBase   = require('./form-section-base')
  , defineFormSection       = require('./form-section')
  , defineNestedMap         = require('./lib/nested-map')
  , definePerson            = require('./person')
  , defineGetTranslations   = require('./lib/define-get-translations')
  , defineStatusHistoryItem = require('./lib/status-history-item')
  , defineToWSJSONPrettyData = require('./lib/define-to-ws-json-pretty-data')
  , defineCertificateCategory = require('./lib/certificate-category');

module.exports = memoize(function (db) {
	var StringLine       = defineStringLine(db)
	  , File             = defineFile(db)
	  , DateType         = defineDate(db)
	  , StatusLog        = defineStatusLog(db)
	  , FormSectionBase  = defineFormSectionBase(db)
	  , FormSection      = defineFormSection(db)
	  , Person           = definePerson(db)
	  , StatusHistoryItem = defineStatusHistoryItem(db)
	  , Document;

	// We assure that certificate categories are defined from now on
	defineCertificateCategory(db);

	// Enum for processing step status
	var CertificateStatus = StringLine.createEnum('CertificateStatus', new Map([
		['pending', { label: _("Pending") }],
		['rejected', { label: _("Rejected") }],
		['approved', { label: _("Approved") }]
	]));

	Document = db.Object.extend('Document', {
		// Document label, fallbacks to label as decided on constructor
		label: { type: StringLine, value: function () { return this.constructor.label; } },
		// Document abbreviation, fallbacks to abbr as decided on constructor
		abbr: { type: StringLine, value: function () { return this.constructor.abbr; } },
		// Document legend, fallbacks to legend as decided on constructor
		legend: { type: StringLine, value: function () { return this.constructor.legend; } },
		// Which entity issued the document.
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
		// Registration corresponding to certificate.
		// Type is overriden to Registration in registraction-new.js
		// (We do no require here Registration type to avoid circular resolution issue)
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
		certificateCategory: {
			type: db.Object,
			value: db.businessRegistryCertificateCategory
		},
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
				if (!this.isCertificate || !this.master.processingSteps) return;
				return this.master.processingSteps.map.processing;
			}
		},
		// Status of certificate
		status: { type: CertificateStatus, value: function (_observe) {
			if (!_observe(this.master.certificates.applicable).has(this)) return;
			if (_observe(this.master._isApproved)) return 'approved';
			if (_observe(this.master._isRejected)) return 'rejected';
			if (!this.processingStep) return;
			if (_observe(this.processingStep._status) === 'approved') return 'approved';
			if (this.processingStep.status) return 'pending';
		} },
		// Is the certificate issued and approved
		isReleased: { type: db.Boolean, value: function () {
			return this.status === 'approved';
		} },
		toWebServiceJSON: {
			value: function (options) {
				var data = {
					code: this.key,
					files: [],
					data: null
				}, owner, db, opts;
				db = this.database;
				opts = Object(options);
				if (this.dataForm.constructor !== this.database.FormSectionBase) {
					data.data = this.toWebServiceJSONPrettyData(
						this.dataForm.toWebServiceJSON(Object.assign({ excludeFiles: true }, opts))
					);
				}
				this.files.ordered.forEach(function (file) {
					data.files.push({
						url: file.url
					});
				});

				if (db.MultipleProcess) {
					owner = this.owner;
					while (owner) {
						if (owner instanceof db.MultipleProcess) {
							data.owner = owner.owner.__id__;
							owner = null;
						} else {
							owner = owner.owner;
						}
					}
				}

				return data;
			}
		},
		// Used for preservation in data snapshots
		toJSON: { value: function (ignore) {
			var data = {
				uniqueKey: this.uniqueKey,
				label: this.database.resolveTemplate(this.label, this.getTranslations(), { partial: true }),
				abbr: this.abbr,
				status: this.status,
				overviewSection: this.overviewSection.toJSON()
			}, statusLog = [];
			if (this.issuedBy) data.issuedBy = this.getOwnDescriptor('issuedBy').valueToJSON();
			if (this.issueDate) data.issueDate = this.getOwnDescriptor('issueDate').valueToJSON();
			if (this.number) data.number = this.getOwnDescriptor('number').valueToJSON();
			var files = [];
			this.files.ordered.forEach(function (file) { files.push(file.toJSON()); });
			if (files.length) data.files = files;
			if (this.dataForm.constructor !== this.database.FormSectionBase) {
				data.section = this.dataForm.toJSON();
				// Strip `files/map` property, as it's exposed directly on `snapshot.files`
				(function self(data) {
					if (data.fields) {
						data.fields = data.fields.filter(function (field) {
							return !field.id.match(/\/files\/map$/);
						});
					}
					if (data.sections) data.sections.forEach(self);
				}(data.section));
			}
			this.statusLog.ordered.forEach(function (statusLogEntry) {
				statusLog.push(statusLogEntry.toJSON());
			});
			if (statusLog.length) data.statusLog = statusLog;

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

	Document.prototype.defineProperties({

		toWSSchema: {
			value: function (ignore) {
				if (typeof process === 'undefined') return;
				var schema = {
					type: "array",
					items: {
						type: "object",
						properties: {
							code: {
								type: "enum",
								ref: "documents"
							},
							data: {}
						}
					}
				};
				schema.items.properties.files =
					this.files.getItemType().prototype.toWSSchema();
				schema.items.properties.owner = { type: "string" };
				if (this.dataForm.constructor !== this.database.FormSectionBase) {
					schema.items.properties.data = this.dataForm.toWSSchema();
				}
				return schema;
			}
		}
	});

	defineToWSJSONPrettyData(Document.prototype);
	defineNestedMap(db);
	// Map of uploaded files
	// Document.prototype.files.map property should be used *only* to generate form controls
	// For "read" uses, always refer to Document.prototype.files.ordered
	Document.prototype.defineNestedMap('files', { itemType: File, cardinalPropertyKey: 'path' });

	// History of document processing
	Document.prototype.defineNestedMap('statusLog',
		{ itemType: StatusLog, cardinalPropertyKey: 'label' });

	Document.prototype.defineNestedMap('statusHistory',
		{ itemType: StatusHistoryItem, cardinalPropertyKey: 'status' });

	Document.prototype.overviewSection.setProperties({
		label: _("Emission data"),
		propertyMasterType: Document,
		propertyNames: ['issuedBy', 'issuedByOfficer', 'registration']
	});

	defineGetTranslations(Document.prototype);

	return Document;
}, { normalizer: require('memoizee/normalizers/get-1')() });
