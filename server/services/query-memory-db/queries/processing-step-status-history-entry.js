'use strict';

var ensureObject   = require('es5-ext/object/valid-object')
  , ensureString   = require('es5-ext/object/validate-stringifiable-value')
  , ensureDatabase = require('dbjs/valid-dbjs');

var getResultItem = function (statusHistoryItem, db) {
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
	var processingStep = statusHistoryItem.owner.owner;
	result.service.businessName = processingStep.master.businessName;
	result.service.id = processingStep.master.__id__;
	result.service.type = processingStep.master.constructor.__id__;
	result.processingStep.label = processingStep.label;
	result.processingStep.path = processingStep.__id__.slice(processingStep.__id__.indexOf('/'));
	result.operator.id = processingStep.processor.__id__;
	result.operator.name = processingStep.processor.fullName;
	result.status.code = statusHistoryItem.status;
	var statusLabel = db.ProcessingStepStatus.meta[statusHistoryItem.status];
	result.status.label = statusLabel && statusLabel.label;
	statusHistoryItem._status._lastModified.map(function (time) {
		time = Math.round(time / 1000);
		result.date.ts = time;
		result.date.date = Number(db.Date(time));
	});

	return result;
};

module.exports = exports = function (db) {
	ensureDatabase(db);

	return function (query) {
		var businessProcessId, businessProcess
		  , statusHistoryItemPath, statusHistoryItem
		  , result;

		ensureObject(query);
		statusHistoryItemPath = query.processingStepPath && ensureString(query.statusHistoryItemPath);
		businessProcessId = ensureString(query.businessProcessId);

		businessProcess = db.BusinessProcess.getById(businessProcessId);
		if (!businessProcess) return;
		if (statusHistoryItemPath) {
			statusHistoryItem = businessProcess.resolveSkeyPath(statusHistoryItemPath);
			if (!statusHistoryItem) return;
		}

		if (statusHistoryItem) {
			result = getResultItem(statusHistoryItem, db);
		} else { // all history of given bp
			result = [];
			businessProcess.processingSteps.applicable.forEach(function self(step) {
				if (step.steps) {
					step.steps.forEach(self);
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
