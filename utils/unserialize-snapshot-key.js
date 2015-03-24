'use strict';

var serializeSnapshotKey = require('./serialize-to-snapshot-key')
  , parse = JSON.parse

  , reCustomFilter = /^\$([a-z0-0]+)=([\0-\uffff]+)$/;

module.exports = function (key) {
	var data = parse('[' + key + ']'), result = {}, page, match;
	if (!isNaN(data[0])) page = Number(data.shift());
	result.appName = data.shift();
	if (data[0]) {
		if (data[0][0] === '?') result.search = data.shift().slice(1);
		else result.status = data.shift();
	}
	if (data[0] && (data[0][0] === '?')) result.search = data.shift().slice(1);
	while (data[0] && (data[0][0] === '$')) {
		match = data.shift().match(reCustomFilter);
		if (!match) continue;
		result[match[1]] = match[2];
	}
	result.snapshotKey = serializeSnapshotKey(result);
	if (page) result.page = page;
	return result;
};
