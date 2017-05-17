'use strict';

var db                                  = require('../../../db')
  , assign                              = require('es5-ext/object/assign')
  , _                                   = require('mano').i18n
  , processingStepsMetaWithoutFrontDesk =
	require('../../../utils/processing-steps-meta-without-front-desk')()
  , capitalize                          = require('es5-ext/string/#/capitalize')
  , resolveFullStepPath                 =
		require('../../../utils/resolve-processing-step-full-path')
  , processingStepsMeta                 = require('../../../processing-steps-meta')
  , getStatusHistory                    = require('../../mongo-queries/get-status-history')
  , getTimeItemTemplate                 = require('./get-time-template')
  , accumulateProcessingTimeItems       = require('./accumulate-processing-time-items')
  , getProcessingWorkingHoursTime       =
		require('../../../utils/get-processing-working-hours-time');

module.exports = function (query) {
	var stepsResult = {};
	Object.keys(processingStepsMetaWithoutFrontDesk).forEach(function (stepShortPath) {
		stepsResult[stepShortPath] = {};
		stepsResult[stepShortPath].label = db['BusinessProcess' +
			capitalize.call(processingStepsMeta[stepShortPath]._services[0])].prototype
			.processingSteps.map.getBySKeyPath(resolveFullStepPath(stepShortPath)).label;
		stepsResult[stepShortPath].rows = { totalProcessing: assign(getTimeItemTemplate(),
			{ processor: _("Total & times") }) };
	});

	return getStatusHistory.find({
		onlyFullItems: true,
		dateFrom: query.dateFrom,
		dateTo: query.dateTo,
		service: query.service,
		excludeFrontDesk: true,
		step: query.step,
		sort: {
			'service.businessName': 1,
			'service.businessId': 1,
			'date.ts': 1
		}
	}).then(function (statusHistory) {
		var currentItem, step;
		statusHistory.forEach(function (statusHistoryItem) {
			if (statusHistoryItem.status.code === 'pending') {
				currentItem = { bpId: statusHistoryItem.service.id };
				currentItem.processingStart = statusHistoryItem.date.ts;
			} else if (currentItem) {
				if (!db[statusHistoryItem.service.type]) {
					currentItem = null;
					return;
				}
				step =
					db[statusHistoryItem.service.type].prototype.resolveSKeyPath(
						statusHistoryItem.processingStep.path
					);
				if (step && step.value) {
					step = step.value;
				} else {
					currentItem = null;
					return;
				}
				if (currentItem.processingStart > statusHistoryItem.date.ts
						|| !currentItem.processingStart ||
						currentItem.bpId !== statusHistoryItem.service.id) {
					currentItem = null;
					return;
				}
				currentItem.processingEnd = statusHistoryItem.date.ts;
				currentItem.businessName = statusHistoryItem.service.businessName;
				currentItem.processingTime =
					getProcessingWorkingHoursTime(currentItem.processingStart, currentItem.processingEnd);
				currentItem.processor = statusHistoryItem.operator.id;
				var stepPath = step.key;
				if (!stepsResult[stepPath]) { // child of group step
					stepPath = step.owner.owner.owner.key + '/' + step.key;
				}
				if (!stepsResult[stepPath].rows[currentItem.processor]) {
					stepsResult[stepPath].rows[currentItem.processor] = {
						processing: assign(getTimeItemTemplate(), {
							processor: statusHistoryItem.operator.name,
							processingPeriods: []
						})
					};
				}
				stepsResult[stepPath].rows[currentItem.processor]
					.processing.processingPeriods.push(currentItem);

				accumulateProcessingTimeItems(
					stepsResult[stepPath].rows[currentItem.processor].processing,
					currentItem
				);
				accumulateProcessingTimeItems(stepsResult[stepPath].rows.totalProcessing, currentItem);

				currentItem = null;
			}
		});
		Object.keys(stepsResult).forEach(function (key) { // put totals in the end
			var totalProcessing = stepsResult[key].rows.totalProcessing;
			delete stepsResult[key].rows.totalProcessing;
			stepsResult[key].rows.totalProcessing = totalProcessing;
		});

		if (query.step) {
			stepsResult = stepsResult[query.step];
		}

		return stepsResult;
	});
};
