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
		// Label (name) of registration
		label: {
			type: StringLine,
			value: function () {
				var Document = this.constructor.Document;
				if (!Document) {
					throw new Error("Cannot resolve label, as there's no document for " +
						JSON.stringify(this.key) + " registration defined");
				}
				return Document.label;
			}
		},
		// Short label (name) of registration
		// Used e.g. in official roles in tables where processes are listed
		shortLabel: {
			type: StringLine,
			value: function () { return this.label; }
		},
		// Whether registration is applicable
		isApplicable: {
			type: db.Boolean,
			value: true
		},
		// Whether registration is mandatory
		isMandatory: {
			type: db.Boolean,
			value: true
		},
		// Whether registration is requested
		isRequested: {
			type: db.Boolean,
			value: true
		},
		// Certificates that are produced for this registration
		certificates: {
			type: Document,
			multiple: true,
			value: function () {
				var certificate = this.master.certificates.map[this.key];
				if (!certificate) {
					throw new Error("No certifate defined for registration name: " +
						JSON.stringify(this.key));
				}
				return certificate;
			}
		},
		// Requirements needed to obtain registration
		requirements: {
			type: Requirement,
			multiple: true
		},
		// Costs that are need to be covered to obtain registration
		costs: {
			type: Cost,
			multiple: true
		}
	}, {
		// Usually registration is about resolution of single certificate document
		// In such case certificate document should be referenced on registration constructor
		// Type is db.Base, as at this point there's no db.Type in dbjs
		// and we're not able to narrow it, to what is expected
		Document: { type: db.Base },
		// Registrations in various views are listed using short abbreviations
		abbr: { type: StringLine },
		// Which institution processes given registration
		institution: { type: Institution }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
