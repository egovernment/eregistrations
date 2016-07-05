// Server-only GET router

'use strict';

var db                      = require('../../../db')
  , assign                  = require('es5-ext/object/assign')
  , getCostsPrintController = require('eregistrations/controller/business-process-costs-print');

module.exports = assign(require('eregistrations/server/routes/authenticated')(), {
    'costs-print': getCostsPrintController(db.${ className })
});
