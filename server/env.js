// Normalizes input environment configuration

'use strict';

var mano = require('mano')

  , env = require('mano').env
  , isEnvProvided = (env != null);

if (!isEnvProvided) mano.env = env = {};

// dev: bool
// Defaults to true if no env provided, false if provided
if (env.dev == null) env.dev = !isEnvProvided;

// port: number
// Defaults to 3177
if (!env.port) env.port = 3177;

// url: url
// Defaults to http://localhost:${port}/
if (!env.url) {
	env.url = 'http://localhost:' + env.port + '/';
}

// smtp: object
// Defaults to logOnly configuration
if (!env.smtp) {
	env.smtp = {
		host: 'localhost',
		from: 'eRegistrations Demo <eregistrations@eregistrations.org>',
		logOnly: true
	};
}

if (!env.databaseStartDate) {
	env.databaseStartDate = new Date(Date.UTC(2016, 0, 1));
}

module.exports = env;
