'use strict';

var stringify = JSON.stringify;

module.exports = function (data) {
	var tokens = [];
	if (data.page) tokens.push(data.page);
	tokens.push(data.appName);
	if (data.status) tokens.push(data.status);
	if (data.search) tokens.push('?' + data.search);
	return stringify(tokens).slice(1, -1);
};
