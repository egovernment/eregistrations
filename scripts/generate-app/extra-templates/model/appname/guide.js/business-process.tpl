// Configuration of guide form section.

'use strict';

var db          = require('../../db')
  , FormSection = require('eregistrations/model/form-section')(db)
  , ${ className } = require('./fields');

require('eregistrations/model/business-process-new/guide')(db);

${ className }.prototype.getOwnDescriptor('determinants').type = FormSection;

module.exports = ${ className };
