'use strict';

var deferred                 = require('deferred')
  , oForEach                 = require('es5-ext/object/for-each')
  , flatten                  = require('es5-ext/array/#/flatten')
  , serializeValue           = require('dbjs/_setup/serialize/value')
  , unserializeValue         = require('dbjs/_setup/unserialize/value')
  , uuid                     = require('time-uuid')

  , uniqIdPrefix             = 'abcdefghiklmnopqrstuvxyz'[Math.floor(Math.random() * 24)]
  , recordRe                 = new RegExp('^[a-zA-Z0-9]+/([a-z0-9A-Z/]+)$')
  , statusHistoryMatchRe     = new RegExp('^statusHistory/map/[a-zA-Z0-9]+/status$')
  , processingStepPropertyRe = new RegExp('^processingSteps/map/([a-zA-Z0-9]+' +
	'(?:/steps/map/[a-zA-Z0-9]+)*)/([a-z0-9A-Z/]+)$')
  , certificatePropertyRe    = new RegExp('^certificates/map/([a-zA-Z0-9]+)/' +
	'([a-z0-9A-Z/]+)$');

var getLogPathSuffix = function () {
	return 'statusHistory/map/' + uniqIdPrefix + uuid();
};

var createLogRecords = function (ownerPath, status, stamp, processor) {
	var logPath = ownerPath + '/' + getLogPathSuffix();

	var records = [{
		id: logPath + '/status',
		data: {
			value: serializeValue(status),
			stamp: stamp
		}
	}];

	if (processor) {
		records.push({
			id: logPath + '/processor',
			data: {
				value: '7' + processor,
				stamp: stamp
			}
		});
	}

	return records;
};

module.exports = function (storages) {
	return deferred.map(Object.keys(storages), function (storageName) {
		var storage = storages[storageName], missing = [];

		return storage.getAllObjectIds().map(function (bpId) {
			var isApprovedStamp, isRejectedStamp, closedLogPresent, rejectedLogPresent
			  , certificateStatuses = {}, certificateLogs = {}, stepStatuses = {}, stepLogs = {}
			  , stepProcessors = {};

			return storage.getObject(bpId).map(function (record) {
				var match, value, stamp, keyPath, certificatePath, certificateKeyPath,
					processingStepPath, processingStepKeyPath;

				match = record.id.match(recordRe);

				if (!match) return;

				keyPath = match[1];
				value = record.data.value && (record.data.value[0] === '7' ?
						record.data.value.slice(1) : unserializeValue(record.data.value));
				stamp = record.data.stamp;

				if ((keyPath === 'isApproved') && (value === true)) {
					isApprovedStamp = stamp;
					return;
				}

				if ((keyPath === 'isRejected') && (value === true)) {
					isRejectedStamp = stamp;
					return;
				}

				match = keyPath.match(statusHistoryMatchRe);

				if (match) {
					if (value === 'closed') closedLogPresent = true;
					if (value === 'rejected') rejectedLogPresent = true;
					return;
				}

				match = keyPath.match(certificatePropertyRe);

				if (match) {
					certificatePath = match[1];
					certificateKeyPath = match[2];

					match = certificateKeyPath.match(statusHistoryMatchRe);

					if (match) {
						if ((value === 'approved') || (value === 'rejected')) {
							certificateLogs[certificatePath] = value;
						}
						return;
					}

					if (!certificateStatuses[certificatePath]) {
						return storage.getComputed(
							bpId + '/certificates/map/' + certificatePath + '/status'
						)(function (data) {
							var value = unserializeValue(data.value);

							if ((value === 'approved') || (value === 'rejected')) {
								certificateStatuses[certificatePath] = { value: value, stamp: data.stamp };
							}
						});
					}

					return;
				}

				match = keyPath.match(processingStepPropertyRe);

				if (match) {
					processingStepPath = match[1];
					processingStepKeyPath = match[2];

					if (processingStepKeyPath === 'status') {
						if ((value === 'approved') || (value === 'rejected')) {
							stepStatuses[processingStepPath] = { value: value, stamp: stamp };
						}
						return;
					}

					if (processingStepKeyPath === 'processor') {
						stepProcessors[processingStepPath] = value;
					}

					match = processingStepKeyPath.match(statusHistoryMatchRe);

					if (match) {
						if ((value === 'approved') || (value === 'rejected')) {
							stepLogs[processingStepPath] = value;
						}
						return;
					}

					return;
				}
			})(function () {
				if (isApprovedStamp && !closedLogPresent) {
					missing.push(createLogRecords(bpId, 'closed', isApprovedStamp));
				} else if (isRejectedStamp && !rejectedLogPresent) {
					missing.push(createLogRecords(bpId, 'rejected', isRejectedStamp));
				}

				oForEach(certificateStatuses, function (status, certificatePath) {

					if (status.value === certificateLogs[certificatePath]) return;

					missing.push(createLogRecords(bpId + '/certificates/map/' + certificatePath,
						status.value, status.stamp));
				});

				oForEach(stepStatuses, function (status, stepPath) {
					if (status.value === stepLogs[stepPath]) return;

					missing.push(createLogRecords(bpId + '/processingSteps/map/' + stepPath,
						status.value, status.stamp, stepProcessors[stepPath]));
				});
			});
		})(function () {
			missing = flatten.call(missing);

			console.log('found', missing.length, 'missing history logs for', storageName);
			return storage.storeMany(missing);
		});
	});
};
