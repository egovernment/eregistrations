'use strict';

var getTime = function (res) {
	var time = 0; // in seconds
	if (res.indexOf('-') !== -1) {
		return -2;
	}
	if (res.indexOf('<') !== -1) {
		return -1;
	}
	if (res.indexOf('h') !== -1) {
		res = res.split('h');
		time += Number(res[0]) * 3600;
		res = res[1];
	}
	if (res.indexOf('m') !== -1) {
		time += Number(res.split('m')[0]) * 60;
	}

	return time;
};

module.exports = function (row) {
	var res, time = 0;
	res = row.replace(/\s+/g, '');

	time = getTime(res);

	return time;
};
