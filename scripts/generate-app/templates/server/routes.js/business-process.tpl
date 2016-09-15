// Server-only GET router

'use strict';

var getRoutes = require('eregistrations/server/routes/business-process')
  , db        = require('../../../db');

module.exports = getRoutes(db.${ className });
