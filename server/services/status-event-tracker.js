'use strict';

var debug = require('debug-ext')('status-events-tracking-service !!!!');

var oForEach    = require('es5-ext/object/for-each')
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

exports.service = function () {
	var driver      = require('mano').dbDriver
	  , currentDate = toDateInTz(new Date(), db.timeZone)
	  , bpCertMap   = {};

	var initDataset = function (date, serviceName) {
		date = date.toISOString().substring(0, 10);

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
			dataset.processingStep[stepName] = { pending: [] };
		}

		return dataset.processingStep[stepName];
	};

	var initStepByProcessorDataset = function (date, serviceName, stepName, processorId) {
		var dataset = initStepPendingDataset(date, serviceName, stepName);

		if (!dataset.byProcessor) dataset.byProcessor = {};

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

			// if (!isDayOff(startDate)) {
			dataset = getDataset(startDate);
			dataset[status].push(bpId);
			// }
		}
	};

	return getData(driver)(function (data) {
		data = filterSteps(data, {});

		debug('- certificates');

		data.certificates.forEach(function (certificateData, certificateName) {
			debug('--', certificateName);

			certificateData.forEach(function (businessProcess) {
				var bpId              = businessProcess.businessProcessId
				  , serviceName       = data.businessProcesses.get(bpId).serviceName
				  , statusHistoryLogs = Array.from(businessProcess.statusHistory.values())
				  , pendingStartDate;

				var getDataset = function (date) {
					return initCertDataset(date, serviceName, certificateName);
				};

				debug('---', bpId);

				// Certificate statuses: pending, rejected, approved
				statusHistoryLogs.forEach(function (statusHistoryLog) {
					var logStauts = statusHistoryLog.status
					  , logDate   = statusHistoryLog.date;

					debug('----', logDate, logStauts);

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

				if (!bpCertMap[bpId]) bpCertMap[bpId] = [];
				bpCertMap[bpId].push(certificateName);
			});
		});

		debug("- business processes");

		data.businessProcesses.forEach(function (businessProcess) {
			var bpId              = businessProcess.businessProcessId
			  , serviceName       = businessProcess.serviceName
			  , statusHistoryLogs = Array.from(businessProcess.statusHistory.values())
			  , certificates      = bpCertMap[bpId]
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

			debug('--', bpId);

			if (businessProcess.submissionDateTime) {
				var submittedDate = toDateInTz(businessProcess.submissionDateTime, db.timeZone);
				// 1.4 [date][serviceName].businessProcess.submitted
				dataset = getDataset(submittedDate);
				dataset.submitted++;
				// 2.4 [date][serviceName].certificate[certificateName].submitted
				incrementCertStatus(submittedDate, 'submitted');
			}

			// Business process statuses: draft, revision, sentBack, process, pickup, rejected,
			// withdrawn, closed
			statusHistoryLogs.forEach(function (statusHistoryLog) {
				var logStauts = statusHistoryLog.status
				  , logDate   = statusHistoryLog.date;

				debug('---', logDate, logStauts);

				if ((logStauts === 'withdrawn') || (logStauts === 'closed')) {
					// 1.5 [date][serviceName].businessProcess.withdrawn
					dataset = getDataset(logDate);
					dataset.withdrawn++;
					// 2.5 [date][serviceName].certificate[certificateName].withdrawn
					incrementCertStatus(logDate, 'withdrawn');
				} else if (logStauts === 'rejected') {
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

				Object.keys(statusStartDates).forEach(function (status) {
					if (status === 'pending') return;

					if (status === logStauts) {
						if (!statusStartDates[status]) statusStartDates[status] = logDate;
					} else if (statusStartDates[status]) {
						// 1.2 [date][serviceName].businessProcess.pickup
						// 1.3 [date][serviceName].businessProcess.sentBack
						storeStatusRange(statusStartDates[status], logDate, status, bpId, getDataset);
						// 2.2 [date][serviceName].certificate[certificateName].pickup
						// 2.3 [date][serviceName].certificate[certificateName].sentBack
						storeCertStatusRange(statusStartDates[status], logDate, status, bpId);

						statusStartDates[status] = null;
					}
				});
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

		debug("- processing steps");

		data.steps.forEach(function (step, stepName) {
			debug('--', stepName);

			step.forEach(function (businessProcess) {
				var bpId              = businessProcess.businessProcessId
				  , serviceName       = data.businessProcesses.get(bpId).serviceName
				  , statusHistoryLogs = Array.from(businessProcess.statusHistory.values())
				  , pendingStartDate  = null
				  , statusStartDates  = { paused: {}, sentBack: {}, redelegated: {} }
				  , dataset;

				debug('---', bpId);

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

					debug('----', logDate, logStauts, logProcessor);

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
