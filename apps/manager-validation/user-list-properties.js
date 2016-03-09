'use strict';

var staticList   = require('./user-list-properties-static')
  , computedList = require('./user-list-properties-computed')
  , Set = require('es6-set')
  , combinedList = new Set([]);

module.exports = combinedList;

staticList.forEach(combinedList.add, combinedList);
computedList.forEach(combinedList.add, combinedList);
