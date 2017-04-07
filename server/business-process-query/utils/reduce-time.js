// Util that helps reduce times of steps and business processees

'use strict';

module.exports = function (data, time/*, opts */) {
	var opts = Object(arguments[2]);
	data.count++;
	if (time) {
		data.timedCount++;
		data.minTime = Math.min(data.minTime, time);
		data.maxTime = Math.max(data.maxTime, time);
		data.totalTime += time;
		data.avgTime = data.totalTime / data.timedCount;
		if (opts && opts.avgTimeMod) {
			data.avgTime *=  opts.avgTimeMod;
		}
	}
};
