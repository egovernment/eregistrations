'use strict';

var ensureObject   = require('es5-ext/object/valid-object')
  , ensureString   = require('es5-ext/object/validate-stringifiable-value')
  , ensureDatabase = require('dbjs/valid-dbjs');

var getResultItem = function (statusHistoryItem, db, query) {
	var result = {
		service: {
			id: null,
			businessName: null,
			type: null
		},
		processingStep: {
			path: null,
			label: null
		},
		operator: {
			id: null,
			name: null
		},
		status: {
			code: null,
			label: null
		},
		date: {
			date: null,
			ts: null
		}
	};
	var processingStep = statusHistoryItem.owner.owner.owner, processor;
	result.service.businessName = processingStep.master.businessName;
	result.service.id = processingStep.master.__id__;
	result.service.type = processingStep.master.constructor.__id__;
	result.processingStep.label = processingStep.label;
	result.processingStep.path = processingStep.__id__.slice(processingStep.__id__.indexOf('/') + 1);
	if (query && query.processorId) {
		processor = db.User.getById(query.processorId);
	} else {
		processor = processingStep.processor;
	}
	result.operator.id = processor && processor.__id__;
	result.operator.name = processor && processor.fullName;
	result.status.code = (query && query.status) || statusHistoryItem.status;
	var statusLabel = db.ProcessingStepStatus.meta[result.status.code];
	result.status.label = statusLabel && statusLabel.label;
	if (query && query.ts) {
		result.date.ts   = query.ts;
		result.date.date = Number(db.Date(query.ts));
	} else {
		statusHistoryItem._status._lastModified.map(function (time) {
			time = Math.round(time / 1000);
			result.date.ts = time;
			result.date.date = Number(db.Date(time));
		});
	}

	return result;
};

module.exports = exports = function (db) {
	ensureDatabase(db);

	return function (query) {
		var businessProcessId, businessProcess
		  , statusHistoryItemPath, statusHistoryItem
		  , result;

		ensureObject(query);
		statusHistoryItemPath = query.statusHistoryItemPath
			&& ensureString(query.statusHistoryItemPath);
		businessProcessId = ensureString(query.businessProcessId);

		businessProcess = db.BusinessProcess.getById(businessProcessId);
		if (!businessProcess) return;
		if (statusHistoryItemPath) {
			statusHistoryItem = businessProcess.resolveSKeyPath(statusHistoryItemPath);
			if (!statusHistoryItem) return;
			statusHistoryItem = statusHistoryItem.value;
		}

		if (statusHistoryItem) {
			result = getResultItem(statusHistoryItem, db, query);
		} else { // all history of given bp
			result = [];
			businessProcess.processingSteps.applicable.forEach(function self(step) {
				if (step.steps) {
					step.steps.map.forEach(self);
				} else {
					step.statusHistory.ordered.forEach(function (statusHistoryItem) {
						result.push(getResultItem(statusHistoryItem, db));
					});
				}
			});
		}

		return result;
	};
};
