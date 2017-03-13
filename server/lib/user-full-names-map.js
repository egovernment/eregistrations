'use strict';

var ComputedEmitter = require('eregistrations/server/utils/computed-emitter')
  , driver          = require('mano').dbDriver;

module.exports = new ComputedEmitter(driver.getStorage('user'), 'fullName');
