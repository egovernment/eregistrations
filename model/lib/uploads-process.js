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
		dataSnapshot: { type: DataSnapshot, nested: true }
	});
	UploadsProcess.prototype.map._descriptorPrototype_.type = RequirementUpload;
	UploadsProcess.prototype.dataSnapshot.define('finalize', {
		type: db.Function,
		value: function (ignore) {
			var data;
			if (!this.jsonString) this.jsonString = this.owner.toJSON();
			data = JSON.parse(this.jsonString);
			if (!data.length) return; // Not applicable
			if (data[0].isFinalized) return; // Already done
			this.owner.applicable.forEach(function (upload) {
				data.some(function (data) {
					var statusLog;
					if (data.uniqueKey !== upload.document.uniqueKey) return;
					if (upload.isApproved) data.status = 'approved';
					else if (upload.isRejected) data.status = 'rejected';
					statusLog = [];
					upload.statusLog.ordered.forEach(function (log) {
						statusLog.push({
							label: log.getOwnDescriptor('label').valueToJSON(),
							time: log.getOwnDescriptor('time').valueToJSON(),
							text: log.getOwnDescriptor('text').valueToJSON()
						});
					});
					if (statusLog.length) data.statusLog = statusLog;
					data.isFinalized = true;
					return true;
				});
			});
			this.jsonString = JSON.stringify(data);
		}
	});
	return UploadsProcess;
}, { normalizer: require('memoizee/normalizers/get-1')() });
