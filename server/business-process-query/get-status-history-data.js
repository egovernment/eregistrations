'use strict';

var deferred                      = require('deferred')
  , capitalize                    = require('es5-ext/string/#/capitalize')
  , aFrom                         = require('es5-ext/array/from')
  , Map                           = require('es6-map')
  , debugLoad                     = require('debug-ext')('load', 6)
  , humanize                      = require('debug-ext').humanize
  , timeZone                      = require('../../db').timeZone
  , toDateInTz                    = require('../../utils/to-date-in-time-zone')
  , resolveProcessingStepFullPath = require('../../utils/resolve-processing-step-full-path')
  , processingStepsMeta           = require('../../processing-steps-meta')

  , recordRe              = new RegExp('^[a-zA-Z0-9]+/([a-z0-9A-Z/]+)$')
  , statusHistoryMatchRe  = new RegExp('^statusHistory\\/map\\/([a-zA-Z0-9]+)/([a-z0-9A-Z\\/]+)$')
  , stepPropertyRe        = new RegExp('^processingSteps\\/map\\/([a-zA-Z0-9]+' +
	'(?:\\/steps\\/map\\/[a-zA-Z0-9]+)*)\\/([a-z0-9A-Z\\/]+)$')
  , certificatePropertyRe = new RegExp('^certificates\\/map\\/([a-zA-Z0-9]+)\\/' +
	'([a-z0-9A-Z\\/]+)$');

var statusHistoryStatusMeta = {
	validate: function (record) { return (record.value[0] === '3'); },
	set: function (data, record) {
		data.status = record.value.slice(1);
		data.date = toDateInTz(new Date(record.stamp / 1000), timeZone);
	}
};

var statusHistoryInit = function (data, statusHistoryId) {
	if (!data.has(statusHistoryId)) {
		data.set(statusHistoryId, {});
	}

	return data.get(statusHistoryId);
};

var statusHistoryConf = {
	businessProcess: {
		metaMap: {
			status: statusHistoryStatusMeta
		}
	},
	certificate: {
		metaMap: {
			status: statusHistoryStatusMeta
		}
	},
	processingStep: {
		metaMap: {
			status: statusHistoryStatusMeta,
			processor: {
				validate: function (record) { return (record.value[0] === '7'); },
				set: function (data, record) {
					data.processor = record.value.slice(1);
				}
			}
		}
	}
};

module.exports = function (driver, data) {
	var stepShortPathMap = new Map()
	  , result           = {
		businessProcesses: new Map(),
		certificates: new Map(),
		steps: new Map()
	}
	  , startTime        = Date.now();

	Object.keys(processingStepsMeta).forEach(function (stepShortPath) {
		stepShortPathMap.set(resolveProcessingStepFullPath(stepShortPath), stepShortPath);
	});

	var initBpDataset = function (bpId) {
		if (!result.businessProcesses.has(bpId)) {
			result.businessProcesses.set(bpId, new Map());
		}

		return result.businessProcesses.get(bpId);
	};

	var initCertDataset = function (certPath, bpId) {
		if (!result.certificates.has(certPath)) {
			result.certificates.set(certPath, new Map());
		}

		if (!result.certificates.get(certPath).has(bpId)) {
			result.certificates.get(certPath).set(bpId, new Map());
		}

		return result.certificates.get(certPath).get(bpId);
	};

	var initStepDataset = function (stepPath, bpId) {
		var stepShortPath = stepShortPathMap.get(stepPath);

		if (!result.steps.has(stepShortPath)) {
			result.steps.set(stepShortPath, new Map());
		}

		if (!result.steps.get(stepShortPath).has(bpId)) {
			result.steps.get(stepShortPath).set(bpId, new Map());
		}

		return result.steps.get(stepShortPath).get(bpId);
	};

	var storeOnMatch = function (statusHistoryConf, keyPath, recordData, getResultMap) {
		var statusHistoryPath, statusHistoryKeyPath, meta, resultMap, match;

		match = keyPath.match(statusHistoryMatchRe);

		if (match) {
			statusHistoryPath = match[1];
			statusHistoryKeyPath = match[2];

			meta = statusHistoryConf.metaMap[statusHistoryKeyPath];
			resultMap = statusHistoryInit(getResultMap(), statusHistoryPath);

			if (!meta.validate(recordData)) return;

			meta.set(resultMap, recordData);

			return true;
		}
	};

	return deferred.map(aFrom(data.businessProcesses.values()), function (businessProcess) {
		var bpId            = businessProcess.businessProcessId
		  , serviceName     = businessProcess.serviceName
		  , serviceFullName = 'businessProcess' + capitalize.call(serviceName)
		  , storage         = driver.getStorage(serviceFullName);

		return storage.getObject(bpId)(function (records) {
			records.forEach(function (record) {
				var match = record.id.match(recordRe)
				  , keyPath, certificatePath, certificateKeyPath, stepPath, stepKeyPath;

				if (!match) return;

				keyPath = match[1];

				// Business process history logs.
				if (storeOnMatch(statusHistoryConf.businessProcess, keyPath, record.data, function () {
						return initBpDataset(bpId);
					})) {
					return;
				}

				// Certificates history logs.
				match = keyPath.match(certificatePropertyRe);
				if (match) {
					certificatePath    = match[1];
					certificateKeyPath = match[2];

					if (storeOnMatch(statusHistoryConf.certificate, certificateKeyPath,
							record.data, function () {
								return initCertDataset(certificatePath, bpId);
							})) {
						return;
					}
				}

				// Processing step history logs.
				match = keyPath.match(stepPropertyRe);
				if (match) {
					stepPath    = match[1];
					stepKeyPath = match[2];

					if (storeOnMatch(statusHistoryConf.processingStep, stepKeyPath, record.data, function () {
							return initStepDataset(stepPath, bpId);
						})) {
						return;
					}
				}
			});
		});
	})(result).aside(function () {
		debugLoad('status history data (in %s)', humanize(Date.now() - startTime));
	});
};
