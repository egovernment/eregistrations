// Util that helps reduce times of steps and business processees

'use strict';

module.exports = function (data, time) {
	data.count++;
	data.minTime = Math.min(data.minTime, time);
	data.maxTime = Math.max(data.maxTime, time);
	data.totalTime += time;
	data.avgTime = data.totalTime / data.count;
};
