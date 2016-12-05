// List of static properties used in users table columns

'use strict';

var Set = require('es6-set');

/**
 * canBeDestroyed is (unlike other properties) computable,
 * so it requires additional configuration steps:
 * 1. It needs to come with corresponding index configuration.
 * 2. It needs dedicated handling in server GET controller.
 */

module.exports = new Set(['firstName', 'lastName', 'email', 'roles', 'institution',
	'canBeDestroyed']);
