// Base BusinessProcess model

'use strict';

var memoize                   = require('memoizee/plain')
  , defineStringLine          = require('dbjs-ext/string/string-line')
  , defineUInteger            = require('dbjs-ext/number/integer/u-integer')
  , defineUrl                 = require('dbjs-ext/string/string-line/url')
  , _                         = require('mano').i18n.bind("Model: Business Process")
  , defineBusinessProcessBase = require('../lib/business-process-base')
  , defineNestedMap           = require('../lib/nested-map')
  , defineStatusLog           = require('../lib/status-log')
  , defineStatusHistoryItem   = require('../lib/status-history-item');

module.exports = memoize(function (db/*, options*/) {
	var options             = Object(arguments[1])
	  , BusinessProcessBase = defineBusinessProcessBase(db)
	  , StringLine          = defineStringLine(db)
	  , UInteger            = defineUInteger(db)
	  , Url                 = defineUrl(db)
	  , StatusLog           = defineStatusLog(db)
	  , StatusHistoryItem   = defineStatusHistoryItem(db)

	  , BusinessProcess;

	defineNestedMap(db);

	BusinessProcess = BusinessProcessBase.extend(options.className || 'BusinessProcess', {
		// General label of business process type
		// It's not specific per business process, but should provide general info as:
		// "Merchant registration", "Company registration" etc.
		label: { type: StringLine },

		// Should contain some action i.e. "start a company"
		registerServiceLabel: { type: StringLine },

		serviceDescription: { type: db.String },

		// General abbreviation of business process type
		// e.g. IT (Individual trader), C (Company), COI (Certificate of incentives)
		abbr: { type: StringLine },

		// Name of businessProcess
		// Usually computed from other properties
		businessName: { type: StringLine, label: _("Business name")  },

		// URL at which archive of files related to given business process
		// is accessible
		filesArchiveUrl: { type: Url },

		submissionNumber: { type: db.Object, nested: true },

		// Whether registration is made online
		// It may be overriden to false in case we import businessProces
		// which not processed electronically.
		// It has its use in "business update" applications where we allow updates
		// of old registrations done at the counter
		isFromEregistrations: { type: db.Boolean, value: true,
			label: _("Has registration been made online?") },

		// Whether business process was created for demo purposes
		isDemo: { type: db.Boolean, value: false },

		// String over which business processes can be searched
		// through interface panel (computed value is later indexed by persistence engine)
		searchString: { type: db.String, value: function (_observe) {
			var arr = [], submissionNumber = _observe(this.submissionNumber._value);
			if (this.businessName) arr.push(this.businessName.toLowerCase());
			if (submissionNumber) arr.push(submissionNumber.toLowerCase());
			return arr.join('\x02');
		} },

		// An array of email addresses used as notification recipients (to field).
		// Uses user and manager emails, if the exist, by default.
		notificationEmails: { type: StringLine, multiple: true, value: function (_observe) {
			var result = [];

			if (this.user) result.push(_observe(this.user._email));
			if (this.manager) result.push(_observe(this.manager._email));

			return result;
		} },
		toWebServiceJSON: {
			value: function (ignore) {
				var dataFields = {}, result, db;
				db = this.database;
				result = {
					id: this.__id__,
					service: {
						code: this.constructor.__id__
					},
					submittedTimestamp:
						this._isSubmitted.lastModified ?
								Math.floor(this._isSubmitted.lastModified / 1000) : null,
					processingSteps: {},
					request: {
						registrations: [],
						documentUploads: [],
						costs: [],
						payments: [],
						certificates: [],
						data: {}
					}
				};

				this.processingSteps.map.forEach(function self(processingStep) {
					if (db.ProcessingStepGroup && processingStep instanceof db.ProcessingStepGroup) {
						processingStep.steps.applicable.forEach(self);
						return;
					}
					result.processingSteps[processingStep.key] = processingStep.toWebServiceJSON();
				});

				this.registrations.requested.forEach(function (reg) {
					result.request.registrations.push({
						code: reg.key
					});
				});

				this.requirementUploads.applicable.forEach(function (upload) {
					result.request.documentUploads.push(upload.toWebServiceJSON());
				});

				this.costs.payable.forEach(function (cost) {
					result.request.costs.push(cost.toWebServiceJSON());
				});

				this.paymentReceiptUploads.applicable.forEach(function (payment) {
					result.request.payments.push(payment.toWebServiceJSON());
				});

				this.certificates.applicable.forEach(function (certificate) {
					result.request.certificates.push(certificate.toWebServiceJSON());
				});

				// toWebServiceJSON is not implemented on FormSectionBase
				if (this.database.FormSectionBase &&
						this.determinants.constructor !== this.database.FormSectionBase) {
					dataFields = this.determinants.toWebServiceJSON();
					Object.keys(dataFields).forEach(function (fieldName) {
						result.request.data[fieldName] = dataFields[fieldName];
					});
				}
				this.dataForms.applicable.forEach(function (section) {
					dataFields = section.toWebServiceJSON();
					Object.keys(dataFields).forEach(function (fieldName) {
						result.request.data[fieldName] = dataFields[fieldName];
					});
				});
				this.submissionForms.applicable.forEach(function (section) {
					dataFields = section.toWebServiceJSON();
					Object.keys(dataFields).forEach(function (fieldName) {
						result.request.data[fieldName] = dataFields[fieldName];
					});
				});

				if (!Object.keys(result.request.data).length) {
					result.request.data = null;
				}

				return result;
			}
		}
	}, {
		draftLimit: { type: UInteger, value: 20 }
	});

	BusinessProcess.prototype.submissionNumber.defineProperties({
		// Stringified complete representation of number
		value: { type: StringLine, value: function () { return this.number; } },
		// Numeric part of number (usually incremented for each file)
		number: { type: UInteger, value: 0 },
		// Convinient stringification
		toString: { value: function (opts) { return this.value; } }
	});

	BusinessProcess.prototype.defineNestedMap('statusLog',
		{ itemType: StatusLog, cardinalPropertyKey: 'label' });

	BusinessProcess.prototype.defineNestedMap('statusHistory',
		{ itemType: StatusHistoryItem, cardinalPropertyKey: 'status' });

	return BusinessProcess;
}, { normalizer: require('memoizee/normalizers/get-1')() });
