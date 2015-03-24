'use strict';

var forEach      = require('es5-ext/object/for-each')
  , primitiveSet = require('es5-ext/object/primitive-set')

  , stringify = JSON.stringify
  , standardKeys = primitiveSet('appName', 'page', 'status', 'search');

module.exports = function (data) {
	var tokens = [];
	if (data.page) tokens.push(data.page);
	tokens.push(data.appName);
	if (data.status) tokens.push(data.status);
	if (data.search) tokens.push('?' + data.search);
	forEach(data, function (value, key) {
		if (standardKeys[key]) return;
		tokens.push('$' +  key + '=' + value);
	}, null, true);
	return stringify(tokens).slice(1, -1);
};
