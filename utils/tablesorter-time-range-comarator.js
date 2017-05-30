'use strict';

var getTime = function (res) {
	var time = 0; // in seconds
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

module.exports = function (a, b) {
	var resA, resB, timeA = 0, timeB = 0;
	resA = a.replace(/\s+/g, '');
	resB = b.replace(/\s+/g, '');

	timeA = getTime(resA);
	timeB = getTime(resB);

	if (timeA === timeB) {
		return 0;
	}

	return timeA < timeB ? 1 : -1;
};
