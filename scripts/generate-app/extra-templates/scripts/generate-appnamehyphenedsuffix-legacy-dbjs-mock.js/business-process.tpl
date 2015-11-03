// Generates mock for legacy

'use strict';

require('../server/utils/ensure-i18n');

var resolve          = require('path').resolve
  , debug            = require('debug-ext')('setup')
  , generateDbjsMock = require('eregistrations/scripts/generate-legacy-dbjs-mock')
  , BusinessProcess  = require('../model/${ appName }');

module.exports = function () {
	debug('generate-${ appNameHyphenedSuffix }-legacy-dbjs-mock');

	return generateDbjsMock(BusinessProcess,
		resolve(__dirname, '../apps/${ appName }/client/legacy/${ appNameHyphenedSuffix }-legacy-proto.js'));
};
