'use strict';

exports.login = require('mano-auth/controller/server/login');
exports.register = require('mano-auth/controller/server/register');
exports['reset-password'] = require('mano-auth/controller/server/reset-password');
exports['request-reset-password'] = require('mano-auth/controller/server/request-reset-password');
