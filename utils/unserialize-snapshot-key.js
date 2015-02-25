'use strict';

var serializeSnapshotKey = require('./serialize-to-snapshot-key')
  , parse = JSON.parse;

module.exports = function (key) {
	var data = parse('[' + key + ']'), result = {};
	if (!isNaN(data[0])) result.page = Number(data.shift());
	result.snapshotKey = serializeSnapshotKey(data);
	result.appName = data.shift();
	if (data[0]) result.status = data.shift();
	if (data[0]) result.search = data.shift();
	return result;
};
