// BusinessProcess user uploads getter

'use strict';

var memoize                 = require('memoizee/plain')
  , defineBusinessProcess   = require('./base')
  , defineRequirementUpload = require('../requirement-upload');

module.exports = memoize(function (db/* options */) {
	var BusinessProcess = defineBusinessProcess(db, arguments[1])
	  , RequirementUpload = defineRequirementUpload(db);
	BusinessProcess.prototype.defineProperties({ userUploads: { type: db.Object, nested: true } });
	BusinessProcess.prototype.userUploads.defineProperties({
		applicable: {
			type: RequirementUpload,
			multiple: true,
			value: function (_observe) {
				var result = [];
				_observe(this.master.requirementUploads.applicable).forEach(function (upload) {
					result.push(upload);
				});
				_observe(this.master.paymentReceiptUploads.applicable).forEach(function (upload) {
					result.push(upload);
				});
				return result;
			}
		}
	});

	return BusinessProcess;
}, { normalizer: require('memoizee/normalizers/get-1')() });
