'use strict';

var db                  = require('../db')
  , processingStepsMeta = require('../processing-steps-meta')
  , capitalize          = require('es5-ext/string/#/capitalize')
  , resolveFullStepPath = require('../utils/resolve-processing-step-full-path');

module.exports = function (shortStepPath) {
	return db['BusinessProcess' +
		capitalize.call(processingStepsMeta[shortStepPath]._services[0])].prototype
		.processingSteps.map.getBySKeyPath(resolveFullStepPath(shortStepPath)).label;
};
