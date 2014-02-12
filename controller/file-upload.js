'use strict';

var dbjsValidate = require('mano/lib/utils/dbjs-form-validate');

module.exports = function (data) { dbjsValidate(data, { changedOnly: true }); };
