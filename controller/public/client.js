'use strict';

exports.login = require('mano-auth/controller/client/login');
exports.register = exports['add-user'] = require('mano-auth/controller/client/register-and-login');
exports['reset-password'] = require('mano-auth/controller/client/reset-password');
exports['request-reset-password'] = require('mano-auth/controller/client/request-reset-password');
