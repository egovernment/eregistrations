'use strict';

var keys = Object.keys;

module.exports = function (result) {
	var processingStep, mapEntry, businessProcesses, processingStepMap = {};
	keys(result).forEach(function (date) {
		processingStepMap[date] = {};
		keys(result[date]).forEach(function (service) {
			processingStepMap[date][service] = {};
			processingStep = processingStepMap[date][service].processingStep = {};
			keys(result[date][service].processingStep).forEach(function (step) {
				processingStep[step] = { pending: result[date][service].processingStep[step].pending };
				mapEntry = result[date][service].processingStep[step].byProcessor;

				keys(mapEntry).forEach(function (processorId) {
					keys(mapEntry[processorId]).forEach(function (status) {
						if (!processingStep[step][status]) {
							processingStep[step][status] = { businessProcess: 0, certificate: {} };
						}
						businessProcesses = mapEntry[processorId][status].businessProcess || 0;
						processingStep[step][status].businessProcess += businessProcesses;

						keys(mapEntry[processorId][status].certificate).forEach(function (cert) {
							if (!processingStep[step][status].certificate[cert]) {
								processingStep[step][status].certificate[cert] = 0;
							}
							processingStep[step][status].certificate[cert] +=
								mapEntry[processorId][status].certificate[cert];
						});
					});
				});
			});
		});
	});

	return processingStepMap;
};
