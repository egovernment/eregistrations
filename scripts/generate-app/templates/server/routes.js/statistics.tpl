// Server-only GET router

'use strict';

var resolve  = require('path').resolve
  , root     = resolve(__dirname, '../../../')
  , logoPath = resolve(root, 'apps-common/pdf-templates/img/logo.png');

module.exports = require('eregistrations/server/routes/statistics')({
	db: require('../../../db'),
	driver: require('mano').dbDriver,
	processingStepsMeta: require('../../../apps-common/processing-steps'),
	logo: logoPath
});
