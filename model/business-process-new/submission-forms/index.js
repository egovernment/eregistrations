'use strict';

var db = require('mano').db;

module.exports = require('../base');
require('./pickup-institution')(db);
