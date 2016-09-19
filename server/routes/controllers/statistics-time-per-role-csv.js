'use strict';

var ensureObject         = require('es5-ext/object/valid-object')
  , assign               = require('es5-ext/object/assign')
  , forEach              = require('es5-ext/object/for-each')
  , isEmpty              = require('es5-ext/object/is-empty')
  , normalizeOptions     = require('es5-ext/object/normalize-options')
  , capitalize           = require('es5-ext/string/#/capitalize')
  , deferred             = require('deferred')
  , ensureDatabase       = require('dbjs/valid-dbjs')
  , debug                = require('debug-ext')('pdf-generator')
  , ensureDriver         = require('dbjs-persistence/ensure-driver')
  , _                    = require('mano').i18n.bind('Statistics time per role pdf')
  , resolveFullStepPath  = require('../../../utils/resolve-processing-step-full-path')
  , getDurationDaysHours = require('../../../view/utils/get-duration-days-hours');

var getProcessingTimesByStepProcessor =
	require('../../statistics/business-process/step-processing-times/reduce');

var getEmptyResult = function () {
	return {
		processed: '-',
		avgTime: '-',
		minTime: '-',
		maxTime: '-',
		totalTime: '-'
	};
};

module.exports = function (configData) {
	var options, db = ensureDatabase(configData.db);
	options = {
		logo: configData.logo,
		driver: ensureDriver(configData.driver),
		db: db,
		processingStepsMeta: ensureObject(configData.processingStepsMeta),
		customFilter: configData.customFilter
	};

	return {
		headers: {
			'Cache-Control': 'no-cache',
			'Content-Type': 'text/csv; charset=utf-8'
		},
		controller: function (query) {
			return getProcessingTimesByStepProcessor(assign(options, query))(function (result) {
				var inserts = { data: [], locale: db.locale,
					logo: options.logo, currentDate: db.DateTime().toString() };
				debug('Generating statistics time per role csv');
				return deferred.map(Object.keys(result.byStepAndProcessor), function (key) {
					var step = getEmptyResult();
					step.label =  db['BusinessProcess' +
						capitalize.call(options.processingStepsMeta[key]._services[0])].prototype
						.processingSteps.map.getBySKeyPath(resolveFullStepPath(key)).label;

					inserts.data.push(step);
					if (isEmpty(result.byStepAndProcessor[key])) return;
					step = assign(step, {
						processed: 0,
						avgTime: 0,
						minTime: Infinity,
						maxTime: 0,
						totalTime: 0
					});
					forEach(result.byStepAndProcessor[key], function (byProcessor) {
						step.processed += byProcessor.processed;
						step.minTime = Math.min(byProcessor.minTime, step.minTime);
						step.maxTime = Math.max(byProcessor.maxTime, step.maxTime);
						step.totalTime += byProcessor.totalTime;
					});
					step.avgTime = getDurationDaysHours(step.totalTime / step.processed);
					step.minTime = getDurationDaysHours(step.minTime);
					step.maxTime = getDurationDaysHours(step.maxTime);
				})(function () {
					var total, processingTotal, correctionTotal, correctionByUsers;
					correctionTotal         = result.byBusinessProcess.totalCorrection;
					correctionTotal.label   = _("Total correcting time");
					correctionByUsers       = normalizeOptions(result.byBusinessProcess.totalCorrection);
					correctionByUsers.label = _("Corrections by the users");
					processingTotal         = result.byBusinessProcess.totalProcessing;
					processingTotal.label   = _("Total process without corrections");
					total                   = result.byBusinessProcess.total;
					total.label             = _("Total process");
					[correctionTotal, correctionByUsers, processingTotal, total].forEach(
						function (totalItem) {
							if (totalItem.avgTime) {
								totalItem.avgTime = getDurationDaysHours(totalItem.avgTime);
							}
							if (totalItem.minTime) {
								totalItem.minTime = getDurationDaysHours(totalItem.minTime);
							}
							if (totalItem.maxTime) {
								totalItem.maxTime = getDurationDaysHours(totalItem.maxTime);
							}
							if (!totalItem.processed) {
								totalItem = assign(totalItem, getEmptyResult());
							}
							inserts.data.push(totalItem);
						}
					);
				})(function () {
					return inserts.data.map(function (row) {
						return [
							row.label,
							row.processed,
							row.avgTime,
							row.minTime,
							row.maxTime
						].join();
					}).join('\n');
				});
			});
		}
	};
};
