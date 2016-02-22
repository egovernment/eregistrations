// BusinessProcess processing steps resolution

'use strict';

var memoize                  = require('memoizee/plain')
  , defineMultipleProcess    = require('../lib/multiple-process')
  , defineProcessingStepBase = require('../processing-step-base')
  , defineBusinessProcess    = require('./base');

module.exports = memoize(function (db/* options */) {
	var BusinessProcess    = defineBusinessProcess(db, arguments[1])
	  , MultipleProcess    = defineMultipleProcess(db)
	  , ProcessingStepBase = defineProcessingStepBase(db);

	BusinessProcess.prototype.defineProperties({
		processingSteps: { type: MultipleProcess, nested: true }
	});

	BusinessProcess.prototype.processingSteps.map._descriptorPrototype_.type = ProcessingStepBase;
	BusinessProcess.prototype.processingSteps.defineProperties({
		// Applicable procesing steps
		applicable: { type: ProcessingStepBase },
		// Revision processing steps
		revisions: { type: ProcessingStepBase, multiple: true, value: function (_observe) {
			var result   = []
			  , revision = this.map.revision;

			if (revision) {
				var isApplicable = revision._get ? _observe(revision._isApplicable) : revision.isApplicable;
				if (isApplicable) result.push(revision);
			}

			return result;
		} }
	});

	return BusinessProcess;
}, { normalizer: require('memoizee/normalizers/get-1')() });
