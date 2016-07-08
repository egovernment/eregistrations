// BusinessProcess data forms (step 1 of Part A) resolution

'use strict';

var _                           = require('mano').i18n.bind('Model')
  , memoize                     = require('memoizee/plain')
  , Map                         = require('es6-map')
  , defineStringLine            = require('dbjs-ext/string/string-line')
  , defineCreateEnum            = require('dbjs-ext/create-enum')
  , definePropertyGroupsProcess = require('../lib/property-groups-process')
  , defineDataSnapshot          = require('../lib/data-snapshot')
  , defineBusinessProcess       = require('./base')
  , defineFormSectionBase       = require('../form-section-base');

module.exports = memoize(function (db/* options */) {
	var BusinessProcess       = defineBusinessProcess(db, arguments[1])
	  , PropertyGroupsProcess = definePropertyGroupsProcess(db)
	  , StringLine            = defineStringLine(db)
	  , FormSectionBase       = defineFormSectionBase(db)
	  , DataSnapshot          = defineDataSnapshot(db);

	defineCreateEnum(db);

	// Enum for forms status
	var DataFormsStatus = StringLine.createEnum('DataFormsStatus', new Map([
		['approved', { label: _("The data is valid") }],
		['rejected', { label: _("The data is invalid"), htmlClass: 'error' }]
	]));

	BusinessProcess.prototype.defineProperties({
		dataForms: { type: PropertyGroupsProcess, nested: true }
	});

	BusinessProcess.prototype.dataForms.defineProperties({
		// Forms data snapshot (saved when file is submitted to Part B)
		dataSnapshot: { type: DataSnapshot, nested: true },

		incompleteOnlinePaymentsDependents: {
			type: FormSectionBase,
			multiple: true,
			value: function (_observe) {
				var result = [];
				this.applicable.forEach(function (section) {
					if (_observe(section._isOnlinePaymentDependent) &&
							_observe(section._status) < 1) {
						result.push(section);
					}
				});

				return result;
			}
		},
		// Verification status of data forms
		status: { type: DataFormsStatus },
		// Eventual rejection details
		rejectReason: { type: db.String, required: true, label: _("Explanation"),
			inputPlaceholder: _("Please write here the reason of rejection") },
		// Whether data forms was validated and all required properties where provided.
		isApproved: { type: db.Boolean, value: function (_observe) {
			return this.status === 'approved';
		} },
		// Whether data forms was rejected and reject reason was provided
		isRejected: { type: db.Boolean, value: function () {
			if (this.status == null) return false;
			if (this.status !== 'rejected') return false;
			return Boolean(this.rejectReason);
		} },

		toJSON: { type: db.Function, value: function (ignore) {
			return {
				sections: this.database.PropertyGroupsProcess.prototype.toJSON.call(this)
			};
		} },
		// Enrich snapshot JSON with reactive configuration of revision related properties
		enrichJSON: { type: db.Function, value: function (data) {
			if (data.isFinalized) return data;
			data.status = this._isApproved.map(function (isApproved) {
				if (isApproved) return 'approved';
				return this._isRejected.map(function (isRejected) {
					if (isRejected) return 'rejected';
				});
			}.bind(this));
			data.rejectReason = this._rejectReason;
			return data;
		} },
		// Finalize snapshot JSON by adding revision status properties
		finalizeJSON: { type: db.Function, value: function (data) {
			if (data.isFinalized) return data;
			if (this.isApproved) data.status = 'approved';
			else if (this.isRejected) data.status = 'rejected';
			if (data.status === 'rejected') {
				data.rejectReason = this.getOwnDescriptor('rejectReason').valueToJSON();
			}
			data.isFinalized = true;
			return data;
		} }
	});

	BusinessProcess.prototype.dataForms.dataSnapshot.defineProperties({
		// Enriches resolved JSON with reactive revision status properties.
		resolve: { value: function (ignore) {
			var data = this.database.DataSnapshot.prototype.resolve.call(this);
			if (!data) return data;
			if (data.isFinalized) return data; // Already done
			this.owner.enrichJSON(data);
			return data;
		} },
		// After request is finalized, we finalize snapshots by extending it with revision status
		// results.
		finalize: { type: db.Function, value: function (ignore) {
			var data;
			if (this.jsonString) {
				data = JSON.parse(this.jsonString);
				if (data.isFinalized) return;
			} else {
				data = this.owner.toJSON();
			}

			this.owner.finalizeJSON(data);
			this.jsonString = JSON.stringify(data);
		} }
	});

	return BusinessProcess;
}, { normalizer: require('memoizee/normalizers/get-1')() });
