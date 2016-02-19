// Generates mock for legacy

'use strict';

// Ensure mano.env
require('../env');

var resolve          = require('path').resolve
  , debug            = require('debug-ext')('setup')
  , generateDbjsMock = require('eregistrations/scripts/generate-legacy-dbjs-mock')
  , BusinessProcess  = require('../model/${ appName }');

module.exports = function () {
	debug('generate-${ appName }-legacy-dbjs-mock');

	return generateDbjsMock(BusinessProcess,
		resolve(__dirname,
			'../apps/${ appName }/client/legacy/${ appName }-legacy-proto.js'));
};
