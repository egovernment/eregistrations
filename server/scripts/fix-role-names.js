// Replaces typical role names written with hyphen notation to camelCase, e.g.:
// 'users-admin' -> 'userAdmin'

'use strict';

var capitalize    = require('es5-ext/string/#/capitalize')
  , hyphenToCamel = require('es5-ext/string/#/hyphen-to-camel')
  , replaceAll    = require('es5-ext/string/#/plain-replace-all')
  , deferred      = require('deferred')
  , globalRewrite = require('../utils/global-rewrite');

module.exports = function (path) {
	return deferred.reduce([
		globalRewrite.bind(null, path, function (content, path) {
			return replaceAll.call(content, '\'users-admin\'', '\'usersAdmin\'');
		}),
		globalRewrite.bind(null, path, function (content, path) {
			return replaceAll.call(content, '\'meta-admin\'', '\'metaAdmin\'');
		}),
		globalRewrite.bind(null, path, function (content, path) {
			return content.replace(/'official-([a-z\-]+)'/g, function (data, shortRoleName) {
				return '\'official' + capitalize.call(hyphenToCamel.call(shortRoleName)) + '\'';
			});
		})
	], function (ignore, next) { return next && next(); }, null);
};
