// Registration (aka Inscription) model

'use strict';

var memoize           = require('memoizee/plain')
  , ensureDb          = require('dbjs/valid-dbjs')
  , defineStringLine  = require('dbjs-ext/string/string-line')
  , defineInstitution = require('./institution')
  , defineDocument    = require('./document')
  , defineRequirement = require('./requirement')
  , defineCost        = require('./cost');

module.exports = memoize(function (db/*, options*/) {
	var StringLine  = defineStringLine(ensureDb(db))
	  , Institution = defineInstitution(db)
	  , Document    = defineDocument(db)
	  , Requirement = defineRequirement(db)
	  , Cost        = defineCost(db)

	  , options = Object(arguments[1]);

	return db.Object.extend(options.className || 'Registration', {
		toString: {
			value: function (options) {
				return this.label;
			}
		},
		// Label (name) of registration
		label: { type: StringLine, value: function () {
			var Document = this.Document;
			if (!Document) {
				throw new Error("Cannot resolve label, as there's no document for " +
					JSON.stringify(this.key) + " registration defined");
			}
			return Document.label;
		} },
		// Short label (name) of registration
		// Used e.g. in official roles in tables where processes are listed
		shortLabel: { type: StringLine, value: function () { return this.label; } },
		// Usually registration is about resolution of single certificate document
		// In such case certificate document should be referenced on registration constructor
		// Type is db.Base, as at this point there's no db.Type in dbjs
		// and we're not able to narrow it, to what is expected
		Document: { type: db.Base },
		// Registrations in various views are listed using short abbreviations
		abbr: { type: StringLine, value: function () {
			var Document = this.Document;
			if (!Document) {
				throw new Error("Cannot resolve abbr, as there's no document for " +
					JSON.stringify(this.key) + " registration defined");
			}
			if (!Document.abbr) {
				throw new Error("Cannot fallback abbr to document, as there's no abbr defined on " +
					"document for " + JSON.stringify(this.key) + " registration");
			}
			return Document.abbr;
		} },
		// Which institution processes given registration
		institution: { type: Institution },

		// Whether registration is applicable
		isApplicable: { type: db.Boolean, value: true },
		// Whether registration is mandatory
		isMandatory: { type: db.Boolean, value: true },
		// Whether registration is requested
		isRequested: { type: db.Boolean, value: true },

		// Certificates that are produced for this registration
		certificates: { type: Document, multiple: true, value: function () {
			var certificate = this.master.certificates.map[this.key];
			if (!certificate) {
				throw new Error("No certificate defined for registration name: " +
					JSON.stringify(this.key));
			}
			return [certificate];
		} },
		// Requirements needed to obtain registration
		requirements: { type: Requirement, multiple: true },
		// Costs that are need to be covered to obtain registration
		costs: { type: Cost, multiple: true },
		// True if and only if every certificate (item of certificates) has isElectronic === true
		isElectronicOnly: {
			type: db.Boolean,
			value: function (_observe) {
				return this.certificates.every(function (certificate) {
					return _observe(certificate._isElectronic);
				});
			}
		}
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
