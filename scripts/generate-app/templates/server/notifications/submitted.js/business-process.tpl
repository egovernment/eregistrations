'use strict';

var db                 = require('../../../../db')
  , defineNotification = require('eregistrations/notifications/business-process-submitted');

module.exports = defineNotification(db.${ className });
