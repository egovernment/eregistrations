'use strict';

module.exports = function (collection, item) {
	collection.timedCount++;
	collection.totalTime += item.processingTime;
	collection.minTime =
		Math.min(collection.minTime, item.processingTime);
	collection.maxTime =
		Math.max(collection.maxTime, item.processingTime);
	collection.avgTime =
		Math.round(collection.totalTime
			/ collection.timedCount);
};
