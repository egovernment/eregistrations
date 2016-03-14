// Resolves short processing step path into full one

'use strict';

var ensureString = require('es5-ext/object/validate-stringifiable-value');

module.exports = function (stepShortPath) {
	return ensureString(stepShortPath).split('/').join('/steps/map/');
};
