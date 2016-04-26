// UploadsProcess model
// Allows processing of map of requirement uploads

'use strict';

var memoize                 = require('memoizee/plain')
  , definePercentage        = require('dbjs-ext/number/percentage')
  , defineMultipleProcess   = require('./multiple-process')
  , defineDataSnapshot      = require('./data-snapshot')
  , defineRequirementUpload = require('../requirement-upload')
  , defineUInteger          = require('dbjs-ext/number/integer/u-integer');

module.exports = memoize(function (db/*, options*/) {
	var Percentage        = definePercentage(db)
	  , MultipleProcess   = defineMultipleProcess(db)
	  , RequirementUpload = defineRequirementUpload(db)
	  , UInteger          = defineUInteger(db)
	  , DataSnapshot      = defineDataSnapshot(db);

	var UploadsProcess = MultipleProcess.extend('UploadsProcess', {
		// Applicable uploads
		applicable: { type: RequirementUpload },
		// Subset of applicable uploads for which document files were uploaded
		uploaded: { type: RequirementUpload, multiple: true, value: function (_observe) {
			var result = [];
			this.applicable.forEach(function (upload) {
				if (_observe(upload.document.files.ordered._size)) result.push(upload);
			});
			return result;
		} },
		// Progress of uploads
		progress: { type: Percentage, value: function (_observe) {
			var totalProgress = 0;
			if (!this.weight) return 1;
			this.applicable.forEach(function (upload) {
				totalProgress += _observe(upload._progress);
			});

			return totalProgress / this.weight;
		} },
		weight: { type: UInteger, value: function () {
			return this.applicable.size;
		} },

		// Subset of approved uploads
		approved: { type: RequirementUpload, multiple: true, value: function (_observe) {
			var result = [];
			this.applicable.forEach(function (upload) {
				if (_observe(upload._isApproved)) result.push(upload);
			});
			return result;
		} },
		// Subset of rejected  uploads
		rejected: { type: RequirementUpload, multiple: true, value: function (_observe) {
			var result = [];
			this.applicable.forEach(function (upload) {
				if (_observe(upload._isRejected)) result.push(upload);
			});
			return result;
		} },
		// Subset of recently rejected  uploads
		// Those for which last status was rejected, but possibly with already cleared status value
		recentlyRejected: { type: RequirementUpload, multiple: true, value: function (_observe) {
			var result = [];
			this.applicable.forEach(function (upload) {
				if (_observe(upload._isRecentlyRejected)) result.push(upload);
			});
			return result;
		} },
		// Progress for "approved" status
		approvalProgress: { value: function (_observe) {
			if (!this.applicable.size) return 1;
			return this.approved.size / this.applicable.size;
		} },
		// Progress of revision
		revisionProgress: { value: function (_observe) {
			if (!this.applicable.size) return 1;
			return (this.approved.size + this.rejected.size) / this.applicable.size;
		} },
		// Uploads data snapshot (saved when file is submitted to Part B)
		dataSnapshot: { type: DataSnapshot, nested: true },

		// Used for data snaphots preservation
		toJSON: { value: function (ignore) {
			var result = [];
			this.applicable.forEach(function (upload) { result.push(upload.toJSON()); });
			return result;
		} }
	});
	UploadsProcess.prototype.map._descriptorPrototype_.type = RequirementUpload;
	UploadsProcess.prototype.dataSnapshot.defineProperties({
		// Enriches resolved JSON with reactive revision status properties
		// It's about state when request is in processing state
		// The state of uploaded files is frozen but it's validation statuses is subject to change
		resolve: { value: function (ignore) {
			var data = this.database.DataSnapshot.prototype.resolve.call(this);
			if (!data) return data;
			if (!data.length) return data; // Nothing to do
			if (data[0].isFinalized) return data; // Already done
			var kind = (this.owner.key === 'requirementUploads')
				? 'requirementUpload' : 'paymentReceiptUpload';
			this.owner.applicable.forEach(function (upload) {
				var uniqueKey = (kind === 'requirementUpload') ? upload.document.uniqueKey : upload.key;
				data.some(function (data) {
					if (data.uniqueKey !== uniqueKey) return;
					upload.enrichJSON(data);
					return true;
				});
			});
			return data;
		} },
		// After request is finalized, we finalize snapshots
		// by extending it with revision status results
		finalize: { type: db.Function, value: function (ignore) {
			var data;
			if (this.jsonString) {
				data = JSON.parse(this.jsonString);
				if (!data.length || data[0].isFinalized) return; // Already done
			}
			data = this.owner.toJSON();
			if (!data.length) {
				if (!this.jsonString) this.jsonString = JSON.stringify(data);
				return;
			}
			var kind = (this.owner.key === 'requirementUploads')
				? 'requirementUpload' : 'paymentReceiptUpload';
			this.owner.applicable.forEach(function (upload) {
				var uniqueKey = (kind === 'requirementUpload') ? upload.document.uniqueKey : upload.key;
				data.some(function (data) {
					if (data.uniqueKey !== uniqueKey) return;
					upload.finalizeJSON(data);
					return true;
				});
			});
			this.jsonString = JSON.stringify(data);
		} }
	});
	return UploadsProcess;
}, { normalizer: require('memoizee/normalizers/get-1')() });
