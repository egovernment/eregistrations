'use strict';

var oForEach             = require('es5-ext/object/for-each')
  , deferred             = require('deferred')
  , debugLoad            = require('debug-ext')('load', 6)
  , humanize             = require('debug-ext').humanize
  , filterSteps          = require('./steps/filter')
  , getData              = require('./get-data')
  , getStatusHistoryData = require('./get-status-history-data')
  , toDateInTz           = require('../../utils/to-date-in-time-zone')
  , db                   = require('../../db')

  , dateMap;

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

var sortStatusHistoryLogs = function (statusHistory) {
	return Array.from(statusHistory.values()).sort(function (a, b) {
		return a.date - b.date;
	});
};

var getDateMap = function (data, statusHistoryData) {
	var currentDate = toDateInTz(new Date(), db.timeZone)
	  , startTime   = Date.now()
	  , result      = {};

	var initDataset = function (date, serviceName) {
		date = date.toISOString().substring(0, 10);

		if (!result[date]) result[date] = {};
		if (!result[date][serviceName]) result[date][serviceName] = {};

		return result[date][serviceName];
	};

	var initBpDataset = function (date, serviceName) {
		var dataset = initDataset(date, serviceName);

		if (!dataset.businessProcess) {
			dataset.businessProcess = { pending: { at: [], start: [], end: [] },
				pickup: [], sentBack: [], submitted: 0, withdrawn: 0, rejected: 0 };
		}

		return dataset.businessProcess;
	};

	var initCertDataset = function (date, serviceName, certificateName) {
		var dataset = initDataset(date, serviceName);

		if (!dataset.certificate) dataset.certificate = {};

		if (!dataset.certificate[certificateName]) {
			dataset.certificate[certificateName] = { pending: { at: [], start: [], end: [] },
				pickup: [], sentBack: [], submitted: 0, withdrawn: 0, rejected: 0 };
		}

		return dataset.certificate[certificateName];
	};

	var initStepPendingDataset = function (date, serviceName, stepName) {
		var dataset = initDataset(date, serviceName);

		if (!dataset.processingStep) dataset.processingStep = {};

		if (!dataset.processingStep[stepName]) {
			dataset.processingStep[stepName] = {
				pending: { at: [], start: [], end: [] },
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

	var getBusinessProcessStatusHistoryLogs = function (bpId) {
		var statusHistoryLogs = statusHistoryData.businessProcesses.get(bpId);

		return statusHistoryLogs ? sortStatusHistoryLogs(statusHistoryLogs) : null;
	};

	var getCertificateStatusHistoryLogs = function (certificateName, bpId) {
		var statusHistoryLogs = statusHistoryData.certificates.get(certificateName).get(bpId);

		return statusHistoryLogs ? sortStatusHistoryLogs(statusHistoryLogs) : null;
	};

	var getProcessingStepStatusHistoryLogs = function (stepName, bpId) {
		var statusHistoryLogs = statusHistoryData.steps.get(stepName).get(bpId);

		return statusHistoryLogs ? sortStatusHistoryLogs(statusHistoryLogs) : null;
	};

	var storeStatusRange = function (startDate, endDate, status, bpId, getDataset) {
		var dataset, pendingStartStored = false;

		startDate = new db.Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());

		if (status === 'pending') {
			while (startDate < endDate) {
				startDate.setDate(startDate.getDate() + 1);

				dataset = getDataset(startDate);

				if (startDate.getDate() === 1) {
					dataset[status].at.push(bpId);
					if (!pendingStartStored) pendingStartStored = true;
				} else if (!pendingStartStored) {
					dataset[status].start.push(bpId);
					pendingStartStored = true;
				}

				if (startDate.valueOf() === endDate.valueOf()) {
					dataset[status].end.push(bpId);
				}
			}
		} else {
			while (startDate < endDate) {
				startDate.setDate(startDate.getDate() + 1);

				dataset = getDataset(startDate);
				dataset[status].push(bpId);
			}
		}
	};

	data = filterSteps(data, {});

	data.certificates.forEach(function (certificateData, certificateName) {
		certificateData.forEach(function (businessProcess) {
			var bpId              = businessProcess.businessProcessId
			  , serviceName       = data.businessProcesses.get(bpId).serviceName
			  , statusHistoryLogs = getCertificateStatusHistoryLogs(certificateName, bpId)
			  , pendingStartDate;

			if (!statusHistoryLogs) return;

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
		  , certificates      = businessProcess.certificates
		  , statusStartDates  = { pending: null, pickup: null, sentBack: null }
		  , statusHistoryLogs = getBusinessProcessStatusHistoryLogs(bpId)
		  , dataset;

		if (!statusHistoryLogs) return;

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
				statusStartDates.pickup = frontDeskData.pendingDate;
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
			  , pendingStartDate  = null
			  , statusStartDates  = { paused: {}, sentBack: {}, redelegated: {} }
			  , statusHistoryLogs = getProcessingStepStatusHistoryLogs(stepName, bpId)
			  , dataset;

			if (!statusHistoryLogs) return;

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

	debugLoad('status history date map (in %s)', humanize(Date.now() - startTime));

	return result;
};

module.exports = deferred.gate(function () {
	var driver = require('mano').dbDriver;

	if (dateMap) {
		return dateMap;
	}

	return getData(driver)(function (data) {
		return getStatusHistoryData(driver, data)(function (statusHistoryData) {
			dateMap = getDateMap(data, statusHistoryData);
			return dateMap;
		});
	});
}, 1);
