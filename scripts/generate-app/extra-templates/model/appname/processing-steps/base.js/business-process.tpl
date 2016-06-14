'use strict';

var db             = require('../../../db')
  , ${ className } = require('../base');

require('eregistrations/model/business-process-new/processing-steps')(db);

module.exports = ${ className };
