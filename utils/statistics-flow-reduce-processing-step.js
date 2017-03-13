'use strict';

/**
 * It's about reduction
 *
 * FROM:
 *
 * [date][serviceName].businessProcess[status] = num;
 * [date][serviceName].certificate[name][status] = num;
 * [date][serviceName].processingStep[stepName].pending.businessProcess = num;
 * [date][serviceName].processingStep[stepName].pending.certificate[name] = num;
 * [date][serviceName].processingStep[stepName].byProcessor[processorId][status].businessProcess =
 * num;
 * [date][serviceName].processingStep[stepName].byProcessor[processorId][status].certificate[name] =
 * num;
 *
 * TO:
 * [date][serviceName][stepName][status].businessProcess   = num;
 * [date][serviceName][stepName][status].certificate[name] = num;
 *
 * @type {Object.keys|*}
 */

var keys = Object.keys;

module.exports = function (result) {
	var processingStep, mapEntry, businessProcesses, processingStepMap = {};
	keys(result).forEach(function (date) {
		processingStepMap[date] = {};
		keys(result[date]).forEach(function (service) {
			processingStepMap[date][service] = {};
			processingStep = processingStepMap[date][service] = {};
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
