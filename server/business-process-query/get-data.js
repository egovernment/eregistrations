// Retrive data for all steps of all files
// (map db data into meta objects for our needs)

'use strict';

var aFrom                         = require('es5-ext/array/from')
  , forEach                       = require('es5-ext/object/for-each')
  , capitalize                    = require('es5-ext/string/#/capitalize')
  , includes                      = require('es5-ext/string/#/contains')
  , Set                           = require('es6-set')
  , Map                           = require('es6-map')
  , deferred                      = require('deferred')
  , memoize                       = require('memoizee')
  , unserializeValue              = require('dbjs/_setup/unserialize/value')
  , resolveKeyPath                = require('dbjs/_setup/utils/resolve-key-path')
  , resolveEventKeys              = require('dbjs-persistence/lib/resolve-event-keys')
  , debugLoad                     = require('debug-ext')('load', 6)
  , humanize                      = require('debug-ext').humanize
  , resolveProcessingStepFullPath = require('../../utils/resolve-processing-step-full-path')
  , toDateInTz                    = require('../../utils/to-date-in-time-zone')
  , timeZone                      = require('../../db').timeZone
  , processingStepsMeta           = require('../../processing-steps-meta')
  , processingStepPropertyRe      = new RegExp('^processingSteps\\/map\\/([a-zA-Z0-9]+' +
	'(?:\\/steps\\/map\\/[a-zA-Z0-9]+)*)\\/([a-z0-9A-Z\\/]+)$')
  , certificatePropertyRe         = new RegExp('^certificates\\/map\\/([a-zA-Z0-9]+)\\/' +
	'([a-z0-9A-Z\\/]+)$');

var metaMap = {
	validate: function (record) {
		return record.value[0] === '7';
	},
	set: function (data, record) {
		data._existing = true;
		data.createdDateTime = new Date(record.stamp / 1000);
	},
	delete: function (data) {
		delete data._existing;
		delete data.createdDateTime;
	}
};

var validateRecord = function (record, meta, multiItemValue) {
	if (!meta) return false;
	if (meta.type && (meta.type !== 'direct')) return false;
	if (multiItemValue && !meta.multiple) return false;
	return meta.validate(record, multiItemValue);
};

module.exports = exports = memoize(function (driver) {
	var storageStepsMap         = new Map()
	  , stepShortPathMap        = new Map()
	  , serviceFullShortNameMap = new Map()
	  , startTime               = Date.now();

	var result = { steps: new Map(), businessProcesses: new Map(), certificates: new Map() };

	forEach(processingStepsMeta, function (meta, stepShortPath) {
		var stepPath = resolveProcessingStepFullPath(stepShortPath);
		stepShortPathMap.set(stepPath, stepShortPath);
		meta._services.forEach(function (serviceName) {
			var serviceFullName = 'businessProcess' + capitalize.call(serviceName)
			  , storage = driver.getStorage(serviceFullName);
			serviceFullShortNameMap.set(serviceFullName, serviceName);
			if (!storageStepsMap.has(storage)) storageStepsMap.set(storage, new Set());
			storageStepsMap.get(storage).add(stepPath);
		});

		result.steps.set(stepShortPath, new Map());
	});

	return deferred.map(aFrom(storageStepsMap), function (data) {
		var storage = data[0], stepPaths = data[1]
		  , serviceName = serviceFullShortNameMap.get(storage.name);

		var initStepDataset = function (stepPath, businessProcessId) {
			var stepShortPath = stepShortPathMap.get(stepPath);

			if (!result.steps.get(stepShortPath).get(businessProcessId)) {
				result.steps.get(stepShortPath).set(businessProcessId, {
					stepShortPath: stepShortPath,
					businessProcessId: businessProcessId,
					stepFullPath: 'processingSteps/map/' + stepPath
				});
			}

			return result.steps.get(stepShortPath).get(businessProcessId);
		};
		var initCertDataset = function (certificatePath, businessProcessId) {
			if (!result.certificates.get(certificatePath)) {
				result.certificates.set(certificatePath, new Map());
			}

			if (!result.certificates.get(certificatePath).get(businessProcessId)) {
				result.certificates.get(certificatePath).set(businessProcessId, {
					certificatePath: certificatePath,
					businessProcessId: businessProcessId
				});
			}

			return result.certificates.get(certificatePath).get(businessProcessId);
		};
		var initBpDataset = function (businessProcessId) {
			if (!result.businessProcesses.has(businessProcessId)) {
				result.businessProcesses.set(businessProcessId,  {
					businessProcessId: businessProcessId,
					serviceName: serviceName
				});
			}

			return result.businessProcesses.get(businessProcessId);
		};

		// Listen for new records
		storage.on('key:&', function (event) {
			var dataset = initBpDataset(event.ownerId);

			if (!metaMap.validate(event.data)) metaMap.delete(dataset);
			else metaMap.set(dataset, event.data);
		});

		// Processing steps
		stepPaths.forEach(function (stepPath) {
			// Processing step properties
			forEach(exports.stepMetaMap, function (meta, stepKeyPath) {
				storage.on('key:processingSteps/map/' + stepPath + '/' + stepKeyPath, function (event) {
					if (event.type !== (meta.type || 'direct')) return;
					if (!meta.validate(event.data)) meta.delete(initStepDataset(stepPath, event.ownerId));
					else meta.set(initStepDataset(stepPath, event.ownerId), event.data);
				});
			});
		});
		// Business process properties
		forEach(exports.businessProcessMetaMap, function (meta, keyPath) {
			storage.on('key:' + keyPath, function (event) {
				if (event.type !== (meta.type || 'direct')) return;
				if (!meta.validate(event.data)) meta.delete(initBpDataset(event.ownerId));
				else meta.set(initBpDataset(event.ownerId), event.data);
			});
		});

		storage.on('update', function (event) {
			var match, certificatePath, certificateKeyPath, stepPath, stepKeyPath;

			if (!event.keyPath) return;

			var updateOnMatch = function (nestedEntityConfs, keyPath, getData) {
				var nestedEntityPath, nestedEntityKeyPath, meta, data;

				return nestedEntityConfs.some(function (nestedEntityConf) {
					match = keyPath.match(nestedEntityConf.matchRe);

					if (match) {
						nestedEntityPath = match[1];
						nestedEntityKeyPath = match[2];

						meta = nestedEntityConf.metaMap[nestedEntityKeyPath];

						if (event.type !== (meta.type || 'direct')) return;

						data = nestedEntityConf.init(getData(), nestedEntityPath);

						if (!meta.validate(event.data)) meta.delete(data);
						else meta.set(data, event.data);

						return true;
					}
				});
			};

			// Business process nested entities
			if (updateOnMatch(exports.businessProcessNestedEntities, event.keyPath, function () {
					return initBpDataset(event.ownerId);
				})) {
				return;
			}

			// Certificates nested entities
			match = event.keyPath.match(certificatePropertyRe);
			if (match) {
				certificatePath = match[1];
				certificateKeyPath = match[2];

				if (updateOnMatch(exports.certificateNestedEntities, certificateKeyPath, function () {
						return initCertDataset(certificatePath, event.ownerId);
					})) {
					return;
				}
			}

			// Processing step nested entities
			match = event.keyPath.match(processingStepPropertyRe);
			if (match) {
				stepPath = match[1];
				stepKeyPath = match[2];

				if (updateOnMatch(exports.processingStepNestedEntities, stepKeyPath, function () {
						return initStepDataset(stepPath, event.ownerId);
					})) {
					return;
				}
			}
		});

		// Get current records
		return deferred(
			storage.search(function (id, record) {
				var bpId = id.split('/', 1)[0]
				  , path, keyPath, multiItemValue, meta, match, stepPath, stepKeyPath
				  , certificatePath, certificateKeyPath, nestedEntityPath, nestedEntityKeyPath;

				if (bpId === id) {
					if (metaMap.validate(record)) metaMap.set(initBpDataset(bpId), record);
					return;
				}
				if (includes.call(id, '*')) {
					keyPath = resolveKeyPath(id);
					path = bpId + '/' + keyPath;
					if (path !== id) multiItemValue = id.slice(path.length + 1);
				} else {
					keyPath = id.slice(bpId.length + 1);
				}

				// Business process properties
				meta = exports.businessProcessMetaMap[keyPath];
				if (validateRecord(record, meta, multiItemValue)) {
					meta.set(initBpDataset(bpId), record, multiItemValue);
					return;
				}
				// Business process nested entities
				if (exports.businessProcessNestedEntities.some(function (nestedEntityConf) {
						match = keyPath.match(nestedEntityConf.matchRe);

						if (match) {
							nestedEntityPath = match[1];
							nestedEntityKeyPath = match[2];

							meta = nestedEntityConf.metaMap[nestedEntityKeyPath];

							if (validateRecord(record, meta, multiItemValue)) {
								meta.set(
									nestedEntityConf.init(initBpDataset(bpId), nestedEntityPath),
									record,
									multiItemValue
								);
								return true;
							}
						}
					})) {
					return;
				}
				// Certificates
				match = keyPath.match(certificatePropertyRe);
				if (match) {
					certificatePath = match[1];
					certificateKeyPath = match[2];

					// Certificate nested entities
					if (exports.certificateNestedEntities.some(function (nestedEntityConf) {
							match = certificateKeyPath.match(nestedEntityConf.matchRe);

							if (match) {
								nestedEntityPath = match[1];
								nestedEntityKeyPath = match[2];

								meta = nestedEntityConf.metaMap[nestedEntityKeyPath];

								if (validateRecord(record, meta, multiItemValue)) {
									meta.set(
										nestedEntityConf.init(initCertDataset(certificatePath, bpId), nestedEntityPath),
										record,
										multiItemValue
									);

									return true;
								}
							}
						})) {
						return;
					}
				}

				// Processing steps
				match = keyPath.match(processingStepPropertyRe);
				if (match) {
					stepPath = match[1];
					stepKeyPath = match[2];

					if (!stepPaths.has(stepPath)) return;

					// Processing step properties
					meta = exports.stepMetaMap[stepKeyPath];
					if (validateRecord(record, meta, multiItemValue)) {
						meta.set(initStepDataset(stepPath, bpId), record, multiItemValue);
						return;
					}

					// Processing step nested entities
					if (exports.processingStepNestedEntities.some(function (nestedEntityConf) {
							match = stepKeyPath.match(nestedEntityConf.matchRe);

							if (match) {
								nestedEntityPath = match[1];
								nestedEntityKeyPath = match[2];

								meta = nestedEntityConf.metaMap[nestedEntityKeyPath];

								if (validateRecord(record, meta, multiItemValue)) {
									meta.set(
										nestedEntityConf.init(initStepDataset(stepPath, bpId), nestedEntityPath),
										record,
										multiItemValue
									);

									return true;
								}
							}
						})) {
						return;
					}
				}
			}),
			deferred.map(Object.keys(exports.businessProcessMetaMap), function (keyPath) {
				var meta = exports.businessProcessMetaMap[keyPath];
				if (meta.type !== 'computed') return;
				return storage.searchComputed({ keyPath: keyPath }, function (id, record) {
					if (!meta.validate(record)) return;
					meta.set(initBpDataset(id.split('/', 1)[0]), record);
				});
			}),
			deferred.map(aFrom(stepPaths), function (stepPath) {
				return deferred.map(Object.keys(exports.stepMetaMap), function (stepPropKeyPath) {
					var meta = exports.stepMetaMap[stepPropKeyPath];
					if (meta.type !== 'computed') return;
					var keyPath = 'processingSteps/map/' + stepPath + '/' + stepPropKeyPath;
					return storage.searchComputed({ keyPath: keyPath }, function (id, record) {
						if (!meta.validate(record)) return;
						meta.set(initStepDataset(stepPath, id.split('/', 1)[0]), record);
					});
				});
			})
		);
	})(result).aside(function () {
		debugLoad('business process db data (in %s)', humanize(Date.now() - startTime));
	});

}, { length: 0 });

// Map of all properties to be mapped to result with corresponding instructions
exports.stepMetaMap = {
	correctionTime: {
		validate: function (record) { return (record.value[0] === '2'); },
		set: function (data, record) { data.correctionTime = unserializeValue(record.value); },
		delete: function (data) { delete data.correctionTime; }
	},
	isReady: {
		type: 'computed',
		validate: function (record) { return (record.value === '11'); },
		set: function (data, record) {
			data.pendingDate = toDateInTz(new Date(record.stamp / 1000), timeZone);
			data.pendingDateTime = new Date(record.stamp / 1000);
		},
		delete: function (data) {
			delete data.pendingDate;
			delete data.pendingDateTime;
		}
	},
	nonProcessingTime: {
		validate: function (record) { return (record.value[0] === '2'); },
		set: function (data, record) { data.nonProcessingTime = unserializeValue(record.value); },
		delete: function (data) { delete data.nonProcessingTime; }
	},
	processingHolidaysTime: {
		validate: function (record) { return (record.value[0] === '2'); },
		set: function (data, record) { data.processingHolidaysTime = unserializeValue(record.value); },
		delete: function (data) { delete data.processingHolidaysTime; }
	},
	processor: {
		validate: function (record) { return (record.value[0] === '7'); },
		set: function (data, record) { data.processor = record.value.slice(1); },
		delete: function (data) { delete data.processor; }
	},
	status: {
		validate: function (record) {
			return (record.value[0] === '3');
		},
		set: function (data, record) {
			if ((record.value === '3approved') || (record.value === '3rejected')) {
				data.processingDate = toDateInTz(new Date(record.stamp / 1000), timeZone);
				data.processingDateTime = new Date(record.stamp / 1000);
			} else {
				delete data.processingDate;
				delete data.processingDateTime;
			}
			data.status = record.value.slice(1);
			data.statusStamp = record.stamp;
		},
		delete: function (data) {
			delete data.processingDate;
			delete data.processingDateTime;
			delete data.status;
			delete data.statusStamp;
		}
	}
};

exports.businessProcessMetaMap = {
	correctionTime: {
		validate: function (record) { return (record.value[0] === '2'); },
		set: function (data, record) { data.correctionTime = unserializeValue(record.value); },
		delete: function (data) { delete data.correctionTime; }
	},
	isApproved: {
		validate: function (record) { return (record.value === '11'); },
		set: function (data, record) {
			data.approvedDateTime = new Date(record.stamp / 1000);
			data.approvedDate = toDateInTz(data.approvedDateTime, timeZone);
		},
		delete: function (data) {
			delete data.approvedDateTime;
			delete data.approvedDate;
		}
	},
	isDemo: {
		validate: function (record) { return (record.value === '11'); },
		set: function (data, record) { data.isDemo = true; },
		delete: function (data) { delete data.isDemo; }
	},
	isSubmitted: {
		validate: function (record) { return (record.value === '11'); },
		set: function (data, record) {
			data.submissionDateTime = new Date(record.stamp / 1000);
		},
		delete: function (data) { delete data.submissionDateTime; }
	},
	processingHolidaysTime: {
		validate: function (record) { return (record.value[0] === '2'); },
		set: function (data, record) { data.processingHolidaysTime = unserializeValue(record.value); },
		delete: function (data) { delete data.processingHolidaysTime; }
	},
	'registrations/requested': {
		type: 'computed',
		validate: function (record) { return Array.isArray(record.value); },
		set: function (data, record) {
			data.registrations = new Set(resolveEventKeys(record.value).map(function (value) {
				return value.slice(value.lastIndexOf('/') + 1);
			}));
		},
		delete: function (data) { delete data.registrations; }
	},
	'certificates/applicable': {
		type: 'computed',
		validate: function (record) { return Array.isArray(record.value); },
		set: function (data, record) {
			data.certificates = new Set(resolveEventKeys(record.value).map(function (value) {
				return value.slice(value.lastIndexOf('/') + 1);
			}));
		},
		delete: function (data) { delete data.certificates; }
	},
	searchString: {
		type: 'computed',
		validate: function (record) { return record.value[0] === '3'; },
		set: function (data, record) { data.searchString = unserializeValue(record.value); },
		delete: function (data) { delete data.searchString; }
	},
	status: {
		type: 'computed',
		validate: function (record) { return (record.value[0] === '3'); },
		set: function (data, record) { data.status = record.value.slice(1); },
		delete: function (data) { delete data.status; }
	},
	submitterType: {
		type: 'computed',
		validate: function (record) { return record.value[0] === '3'; },
		set: function (data, record) { data.submitterType = record.value.slice(1); },
		delete: function (data) { delete data.submitterType; }
	}
};

var statusHistoryMatchRe = new RegExp('^statusHistory\\/map\\/([a-zA-Z0-9]+)/([a-z0-9A-Z\\/]+)$');
var statusHistoryEntityInit = function (data, nestedEntityId) {
	if (!data.statusHistory) data.statusHistory = new Map();

	if (!data.statusHistory.has(nestedEntityId)) {
		data.statusHistory.set(nestedEntityId, {});
	}

	return data.statusHistory.get(nestedEntityId);
};

var statusHistoryStatusMeta = {
	validate: function (record) { return (record.value[0] === '3'); },
	set: function (data, record) {
		data.status = record.value.slice(1);
		data.date = toDateInTz(new Date(record.stamp / 1000), timeZone);
	},
	delete: function (data) {
		delete data.status;
		delete data.date;
	}
};

exports.businessProcessNestedEntities = [{
	matchRe: statusHistoryMatchRe,
	init: statusHistoryEntityInit,
	metaMap: {
		status: statusHistoryStatusMeta
	}
}];

exports.certificateNestedEntities = [{
	matchRe: statusHistoryMatchRe,
	init: statusHistoryEntityInit,
	metaMap: {
		status: statusHistoryStatusMeta
	}
}];

exports.processingStepNestedEntities = [{
	matchRe: statusHistoryMatchRe,
	init: statusHistoryEntityInit,
	metaMap: {
		status: statusHistoryStatusMeta,
		processor: {
			validate: function (record) { return (record.value[0] === '7'); },
			set: function (data, record) {
				data.processor = record.value.slice(1);
			},
			delete: function (data) {
				delete data.processor;
			}
		}
	}
}];
