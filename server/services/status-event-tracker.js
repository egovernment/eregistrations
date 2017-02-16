'use strict';

var debug = require('debug-ext')('status-event-tracker');

var oForEach    = require('es5-ext/object/for-each')
  , Set         = require('es6-set')
  , isSet       = require('es6-set/is-set')
  , getData     = require('../business-process-query/get-data')
  , filterSteps = require('../business-process-query/steps/filter')
  , toDateInTz  = require('../../utils/to-date-in-time-zone')
  , db          = require('../../db');

var dateMap = {};

/*
Date map layout:

[date][serviceName] = {
	// Business process statuses: draft, revision, sentBack, process, pickup, rejected,
	// withdrawn, closed
	businessProcess: {
		// 1.1 From [isSubmitted || revision || process] until ![revision || process]
		pending: [bpId1, bpId2, …, bpIdn]
		// 1.2 From pickup until !pickup
		pickup: [bpId1, bpId2, …, bpIdn],
		// 1.3 From sentBack until !sentBack
		sentBack: [bpId1, bpId2, …, bpIdn],
		// 1.4 Maps to isSubmitted
		submitted: sum,
		// 1.5 At withdrawn or closed
		withdrawn: sum,
		// 1.6 At rejected
		rejected: sum
	},
	// Certificate statuses: pending, rejected, approved
	certificate[certificateName]: {
		// 2.1 From pending until [rejected || approved]
		pending: [bpId1, bpId2, …, bpIdn]
		// 2.2 On business process - From pickup until !pickup
		pickup: [bpId1, bpId2, …, bpIdn],
		// 2.3 On business process - From sentBack until !sentBack
		sentBack: [bpId1, bpId2, …, bpIdn],
		// 2.4 On business process - Maps to isSubmitted
		submitted: sum,
		// 2.5 On business process - At withdrawn or closed
		withdrawn: sum,
		// 2.6 On business process - At rejected
		rejected: sum
	},
	// Processing step stauses: pending, paused, sentBack, rejected, approved, redelegated
	processingStep[stepName]: {
		// 3.1 From pending until !pending
		pending: [bpId1, bpId2, …, bpIdn],
		byProcessor[processorId]: {
			// 3.2 From paused until !paused
			paused: [bpId1, bpId2, …, bpIdn],
			// 3.3 From sentBack until !sentBack
			sentBack: [bpId1, bpId2, …, bpIdn],
			// 3.4 From redelegated until !redelegated
			redelegated: [bpId1, bpId2, …, bpIdn],
			// 3.5 At rejected
			rejected: [bpId1, bpId2, …, bpIdn],
			// 3.6 At approved
			approved: [bpId1, bpId2, …, bpIdn]
		}
	}
};
 */

var dbDateToISO = function (date) {
	return date.toISOString().substring(0, 10);
};

var getStatusHistoryLogs = function (statusHistory) {
	return Array.from(statusHistory.values()).sort(function (a, b) {
		return a.date - b.date;
	});
};

module.exports = function () {
	var driver      = require('mano').dbDriver
	  , currentDate = toDateInTz(new Date(), db.timeZone);

	var initDataset = function (date, serviceName) {
		date = dbDateToISO(date);

		if (!dateMap[date]) dateMap[date] = {};
		if (!dateMap[date][serviceName]) dateMap[date][serviceName] = {};

		return dateMap[date][serviceName];
	};

	var initBpDataset = function (date, serviceName) {
		var dataset = initDataset(date, serviceName);

		if (!dataset.businessProcess) {
			dataset.businessProcess = { pending: [], pickup: [], sentBack: [],
				submitted: 0, withdrawn: 0, rejected: 0 };
		}

		return dataset.businessProcess;
	};

	var initCertDataset = function (date, serviceName, certificateName) {
		var dataset = initDataset(date, serviceName);

		if (!dataset.certificate) dataset.certificate = {};

		if (!dataset.certificate[certificateName]) {
			dataset.certificate[certificateName] = { pending: [], pickup: [], sentBack: [],
				submitted: 0, withdrawn: 0, rejected: 0 };
		}

		return dataset.certificate[certificateName];
	};

	var initStepPendingDataset = function (date, serviceName, stepName) {
		var dataset = initDataset(date, serviceName);

		if (!dataset.processingStep) dataset.processingStep = {};

		if (!dataset.processingStep[stepName]) {
			dataset.processingStep[stepName] = {
				pending: [],
				byProcessor: {}
			};
		}

		return dataset.processingStep[stepName];
	};

	var initStepByProcessorDataset = function (date, serviceName, stepName, processorId) {
		var dataset = initStepPendingDataset(date, serviceName, stepName);

		if (!dataset.byProcessor[processorId]) {
			dataset.byProcessor[processorId] = { paused: [], sentBack: [], redelegated: [],
				rejected: [], approved: [] };
		}

		return dataset.byProcessor[processorId];
	};

	var storeStatusRange = function (startDate, endDate, status, bpId, getDataset) {
		var dataset;

		startDate = new db.Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());

		while (startDate < endDate) {
			startDate.setDate(startDate.getDate() + 1);

			// TODO: Do we need to skip those:
			// if (!isDayOff(startDate)) {
			dataset = getDataset(startDate);
			dataset[status].push(bpId);
			// }
		}
	};

	return getData(driver)(function (data) {
		data = filterSteps(data, {});

		data.certificates.forEach(function (certificateData, certificateName) {
			certificateData.forEach(function (businessProcess) {
				var bpId              = businessProcess.businessProcessId
				  , serviceName       = data.businessProcesses.get(bpId).serviceName
				  , statusHistoryLogs = getStatusHistoryLogs(businessProcess.statusHistory)
				  , pendingStartDate;

				var getDataset = function (date) {
					return initCertDataset(date, serviceName, certificateName);
				};

				// Certificate statuses: pending, rejected, approved
				statusHistoryLogs.forEach(function (statusHistoryLog) {
					var logStauts = statusHistoryLog.status
					  , logDate   = statusHistoryLog.date;

					if (logStauts === 'pending') {
						if (!pendingStartDate) pendingStartDate = logDate;
					} else if (pendingStartDate) {
						// 2.1 [date][serviceName].certificate[certificateName].pending
						storeStatusRange(pendingStartDate, logDate, 'pending', bpId, getDataset);
						pendingStartDate = null;
					}
				});

				if (pendingStartDate) {
					// 2.1 [date][serviceName].certificate[certificateName].pending
					storeStatusRange(pendingStartDate, currentDate, 'pending', bpId, getDataset);
					pendingStartDate = null;
				}
			});
		});

		data.businessProcesses.forEach(function (businessProcess) {
			var bpId              = businessProcess.businessProcessId
			  , serviceName       = businessProcess.serviceName
			  , statusHistoryLogs = getStatusHistoryLogs(businessProcess.statusHistory)
			  , certificates      = businessProcess.certificates
			  , statusStartDates  = { pending: null, pickup: null, sentBack: null }
			  , dataset;

			var getDataset = function (date) {
				return initBpDataset(date, serviceName);
			};

			var incrementCertStatus = function (date, status) {
				if (!certificates) return;

				certificates.forEach(function (certificateName) {
					dataset = initCertDataset(date, serviceName, certificateName);
					dataset[status]++;
				});
			};

			var storeCertStatusRange = function (startDate, endDate, status, bpId) {
				if (!certificates) return;

				certificates.forEach(function (certificateName) {
					storeStatusRange(startDate, endDate, status, bpId, function (date) {
						return initCertDataset(date, serviceName, certificateName);
					});
				});
			};

			if (businessProcess.submissionDateTime) {
				var submittedDate = toDateInTz(businessProcess.submissionDateTime, db.timeZone);
				// 1.4 [date][serviceName].businessProcess.submitted
				dataset = getDataset(submittedDate);
				dataset.submitted++;
				// 2.4 [date][serviceName].certificate[certificateName].submitted
				incrementCertStatus(submittedDate, 'submitted');
			}

			if (data.steps.get('frontDesk') && data.steps.get('frontDesk').get(bpId)) {
				var frontDeskData = data.steps.get('frontDesk').get(bpId);

				if (frontDeskData.pendingDate) {
					statusStartDates.pickup = frontDeskData.pendingDate
				}

				if (frontDeskData.status === 'approved') {
					var statusDate = toDateInTz(new Date(frontDeskData.statusStamp / 1000), db.timeZone);
					// 1.5 [date][serviceName].businessProcess.withdrawn
					dataset = getDataset(statusDate);
					dataset.withdrawn++;
					// 2.5 [date][serviceName].certificate[certificateName].withdrawn
					incrementCertStatus(statusDate, 'withdrawn');

					if (statusStartDates.pickup) {
						// 1.3 [date][serviceName].businessProcess.pickup
						storeStatusRange(statusStartDates.pickup, statusDate, 'pickup', bpId, getDataset);
						// 2.3 [date][serviceName].certificate[certificateName].pickup
						storeCertStatusRange(statusStartDates.pickup, statusDate, 'pickup', bpId);

						statusStartDates.pickup = null;
					}
				}
			}

			// Business process statuses: draft, revision, sentBack, process, pickup, rejected,
			// withdrawn, closed
			statusHistoryLogs.forEach(function (statusHistoryLog) {
				var logStauts = statusHistoryLog.status
				  , logDate   = statusHistoryLog.date;

				if (logStauts === 'rejected') {
					// 1.6 [date][serviceName].businessProcess.rejected
					dataset = getDataset(logDate);
					dataset.rejected++;
					// 2.6 [date][serviceName].certificate[certificateName].rejected
					incrementCertStatus(logDate, 'rejected');
				}

				if ((logStauts === 'revision') || (logStauts === 'process')) {
					if (!statusStartDates.pending) statusStartDates.pending = logDate;
				} else if (statusStartDates.pending) {
					// 1.1 [date][serviceName].businessProcess.pending
					storeStatusRange(statusStartDates.pending, logDate, 'pending', bpId, getDataset);
					statusStartDates.pending = null;
				}

				if (logStauts === 'sentBack') {
					if (!statusStartDates.sentBack) statusStartDates.sentBack = logDate;
				} else if (statusStartDates.sentBack) {
					// 1.3 [date][serviceName].businessProcess.sentBack
					storeStatusRange(statusStartDates.sentBack, logDate, 'sentBack', bpId, getDataset);
					// 2.3 [date][serviceName].certificate[certificateName].sentBack
					storeCertStatusRange(statusStartDates.sentBack, logDate, 'sentBack', bpId);

					statusStartDates.sentBack = null;
				}
			});

			Object.keys(statusStartDates).forEach(function (status) {
				if (statusStartDates[status]) {
					// 1.1 [date][serviceName].businessProcess.pending
					// 1.2 [date][serviceName].businessProcess.pickup
					// 1.3 [date][serviceName].businessProcess.sentBack
					storeStatusRange(statusStartDates[status], currentDate, status, bpId, getDataset);

					if (status !== 'pending') {
						// 2.2 [date][serviceName].certificate[certificateName].pickup
						// 2.3 [date][serviceName].certificate[certificateName].sentBack
						storeCertStatusRange(statusStartDates[status], currentDate, status, bpId);
					}

					statusStartDates[status] = null;
				}
			});
		});

		data.steps.forEach(function (step, stepName) {
			step.forEach(function (businessProcess) {
				var bpId              = businessProcess.businessProcessId
				  , serviceName       = data.businessProcesses.get(bpId).serviceName
				  , statusHistoryLogs = getStatusHistoryLogs(businessProcess.statusHistory)
				  , pendingStartDate  = null
				  , statusStartDates  = { paused: {}, sentBack: {}, redelegated: {} }
				  , dataset;

				var getPendingDataset = function (date) {
					return initStepPendingDataset(date, serviceName, stepName);
				};

				var getByProcessorDataset = function (date, processorId) {
					return initStepByProcessorDataset(date, serviceName, stepName, processorId);
				};

				// Processing step stauses: pending, paused, sentBack, rejected, approved, redelegated
				statusHistoryLogs.forEach(function (statusHistoryLog) {
					var logStauts    = statusHistoryLog.status
					  , logDate      = statusHistoryLog.date
					  , logProcessor = statusHistoryLog.processor;

					if (logStauts === 'approved') {
						// 3.6 [date][serviceName].processingStep[stepName].byProcessor.approved
						dataset = getByProcessorDataset(logDate, logProcessor);
						dataset.approved.push(bpId);
					} else if (logStauts === 'rejected') {
						// 3.5 [date][serviceName].processingStep[stepName].byProcessor.rejected
						dataset = getByProcessorDataset(logDate, logProcessor);
						dataset.rejected.push(bpId);
					}

					if (logStauts === 'pending') {
						if (!pendingStartDate) pendingStartDate = logDate;
					} else if (pendingStartDate) {
						// 3.1 [date][serviceName].processingStep[stepName].pending
						storeStatusRange(pendingStartDate, logDate, 'pending', bpId, getPendingDataset);
						pendingStartDate = null;
					}

					oForEach(statusStartDates, function (statusData, status) {
						if (status === logStauts) {
							if (!statusData.date) {
								statusData.date = logDate;
								statusData.processor = logProcessor;
							}
						} else if (statusData.date) {
							// 3.2 [date][serviceName].processingStep[stepName].byProcessor.paused
							// 3.3 [date][serviceName].processingStep[stepName].byProcessor.sentBack
							// 3.4 [date][serviceName].processingStep[stepName].byProcessor.redelegated
							storeStatusRange(statusData.date, logDate, status, bpId, function (date) {
								return getByProcessorDataset(date, statusData.processor);
							});
							statusData.date = null;
							statusData.processor = null;
						}
					});
				});

				if (pendingStartDate) {
					// 3.1 [date][serviceName].processingStep[stepName].pending
					storeStatusRange(pendingStartDate, currentDate, 'pending', bpId, getPendingDataset);
					pendingStartDate = null;
				}

				oForEach(statusStartDates, function (statusData, status) {
					if (statusData.date) {
						// 3.2 [date][serviceName].processingStep[stepName].byProcessor.paused
						// 3.3 [date][serviceName].processingStep[stepName].byProcessor.sentBack
						// 3.4 [date][serviceName].processingStep[stepName].byProcessor.redelegated
						storeStatusRange(statusData.date, currentDate, status, bpId, function (date) {
							return getByProcessorDataset(date, statusData.processor);
						});
						statusData.date = null;
						statusData.processor = null;
					}
				});
			});
		});
	}).done();
};

/*
Result map of calculateStatusEventsSums:

[serviceName] = {
	// 1
	businessProcess[status]: sum,
	// 2
	certificate[certificateName][status]: sum,
	processingStep[stepName]: {
		// 3.1
		pending: {
			// 3.1.1
			businessProcess: sum,
			// 3.1.2
			certificate[certificateName]: sum
		},
		// 3.2
		byProcessor[processorId][status]: {
			// 3.2.1
			businessProcess: sum,
			// 3.2.2
			certificate[certificateName]: sum
		}
	}
};
 */

module.exports.calculateStatusEventsSums = function (dateFrom, dateTo) {
	// TODO: Should we wait somehow until the service finishes initial calculation?
	var resultMap = {};

	dateFrom = dbDateToISO(dateFrom);
	dateTo = dbDateToISO(dateTo);

	var storeStatusData = function (resultSet, field, statusData) {
		if (Array.isArray(statusData)) {
			if (!resultSet[field]) resultSet[field] = new Set();

			statusData.forEach(Set.prototype.add.bind(resultSet[field]));
		} else {
			if (resultSet[field] == null) resultSet[field] = 0;

			resultSet[field] += statusData;
		}
	};

	var storePerStatusResult = function (data, resultSet) {
		oForEach(data, function (statusData, status) {
			storeStatusData(resultSet, status, statusData);
		});
	};

	oForEach(dateMap, function (dateData, date) {
		// TODO: This uses string comparison between ISO date string representation. Correct?
		if (date < dateFrom || date > dateTo) return;

		oForEach(dateData, function (serviceData, serviceName) {
			var serviceResult;

			if (!resultMap[serviceName]) {
				resultMap[serviceName] = {
					businessProcess: {},
					certificate: {},
					processingStep: {}
				};
			}

			serviceResult = resultMap[serviceName];

			// TODO: Is this even possible to have a day that had status events for processing
			// steps and not for business process?
			// if (serviceData.businessProcess) {

			// 1 [serviceName].businessProcess[status]
			storePerStatusResult(serviceData.businessProcess, serviceResult.businessProcess);

			// }

			if (serviceData.certificate) {
				oForEach(serviceData.certificate, function (certificateData, certificateName) {
					if (!serviceResult.certificate[certificateName]) {
						serviceResult.certificate[certificateName] = {};
					}

					// 2 [serviceName].certificate[certificateName][status]
					storePerStatusResult(certificateData, serviceResult.certificate[certificateName]);
				});
			}

			if (serviceData.processingStep) {
				oForEach(serviceData.processingStep, function (stepData, stepName) {
					var stepResult;

					if (!serviceResult.processingStep[stepName]) {
						serviceResult.processingStep[stepName] = {
							pending: { businessProcess: 0, certificate: {} },
							byProcessor: {}
						};
					}

					stepResult = serviceResult.processingStep[stepName];

					// 3.1.1 [serviceName].processingStep[stepName].pending.businessProcess
					storeStatusData(stepResult.pending, 'businessProcess', stepData.pending);

					// 3.1.2 [serviceName].processingStep[stepName].pending.certificate[certificateName]
					// TODO

					oForEach(stepData.byProcessor, function (byProcessorData, processorId) {
						var processorResult;

						if (!stepResult.byProcessor[processorId]) stepResult.byProcessor[processorId] = {};

						processorResult = stepResult.byProcessor[processorId];

						// 3.2.1 [serviceName].processingStep[stepName].byProcessor.businessProcess
						// TODO: Should end at '.businessProcess'
						storePerStatusResult(byProcessorData, processorResult);

						// 3.2.2 [serviceName].processingStep[stepName].byProcessor.certificate[certificateName]
						// TODO
					});
				});
			}
		});
	});

	var eachStatusSetToSum = function (dataSet) {
		Object.keys(dataSet).forEach(function (status) {
			if (isSet(dataSet[status])) {
				dataSet[status] = dataSet[status].size;
			}
		});
	};

	oForEach(resultMap, function (serviceResult) {
		// 1 [serviceName].businessProcess[status]
		eachStatusSetToSum(serviceResult.businessProcess);

		// 2 [serviceName].certificate[certificateName][status]
		oForEach(serviceResult.certificate, eachStatusSetToSum);

		oForEach(serviceResult.processingStep, function (stepResult, stepName) {
			// 3.1.1 [serviceName].processingStep[stepName].pending.businessProcess
			stepResult.pending.businessProcess = stepResult.pending.businessProcess.size;
			// 3.1.2 [serviceName].processingStep[stepName].pending.certificate[certificateName]
			// TODO

			// 3.2.1 [serviceName].processingStep[stepName].byProcessor.businessProcess
			// TODO: Should end at '.businessProcess'
			oForEach(stepResult.byProcessor, eachStatusSetToSum);

			// 3.2.2 [serviceName].processingStep[stepName].byProcessor.certificate[certificateName]
			// TODO
		});
	});

	return resultMap;
};
