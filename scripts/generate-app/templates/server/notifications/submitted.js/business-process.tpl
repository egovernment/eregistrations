'use strict';

var db = require('mano').db
  , assign = require('es5-ext/object/assign');

module.exports = assign(exports,
	require('eregistrations/notifications/business-process-submitted'));

exports.trigger = db.${ className }
	.instances.filterByKey('isFromEregistrations', true).filterByKeyPath('isSubmitted', true);
