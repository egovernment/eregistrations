// BusinessProcess processing steps resolution

'use strict';

var memoize               = require('memoizee/plain')
  , defineMultipleProcess = require('../lib/multiple-process')
  , defineProcessingStep  = require('../processing-step')
  , defineBase            = require('./base');

module.exports = memoize(function (db/* options */) {
	var BusinessProcess = defineBase(db, arguments[1])
	  , MultipleProcess = defineMultipleProcess(db)
	  , ProcessingStep = defineProcessingStep(db);

	BusinessProcess.prototype.defineProperties({
		processingSteps: { type: MultipleProcess, nested: true }
	});
	BusinessProcess.prototype.processingSteps.map._descriptorPrototype_.type = ProcessingStep;
	BusinessProcess.prototype.processingSteps.defineProperties({
		// Applicable procesing steps
		applicable: { type: ProcessingStep }
	});
	return BusinessProcess;
}, { normalizer: require('memoizee/normalizers/get-1')() });
