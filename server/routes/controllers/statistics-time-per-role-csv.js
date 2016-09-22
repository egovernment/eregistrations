'use strict';

var ensureObject         = require('es5-ext/object/valid-object')
  , assign               = require('es5-ext/object/assign')
  , forEach              = require('es5-ext/object/for-each')
  , isEmpty              = require('es5-ext/object/is-empty')
  , capitalize           = require('es5-ext/string/#/capitalize')
  , debug                = require('debug-ext')('pdf-generator')
  , ensureDriver         = require('dbjs-persistence/ensure-driver')
  , db                   = require('../../../db')
  , _                    = require('mano').i18n.bind('Statistics time per role pdf')
  , resolveFullStepPath  = require('../../../utils/resolve-processing-step-full-path')
  , getDurationDaysHours = require('../../../view/utils/get-duration-days-hours');

var getProcessingTimesByStepProcessor =
	require('../../statistics/business-process/query-times');

var getEmptyResult = function () {
	return {
		count: '-',
		avgTime: '-',
		minTime: '-',
		maxTime: '-',
		totalTime: '-'
	};
};

module.exports = function (configData) {
	var options = {
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

				forEach(result.byStepAndProcessor, function (data, key) {
					var step = getEmptyResult();
					step.label =  db['BusinessProcess' +
						capitalize.call(options.processingStepsMeta[key]._services[0])].prototype
						.processingSteps.map.getBySKeyPath(resolveFullStepPath(key)).label;

					inserts.data.push(step);
					if (isEmpty(data)) return;
					step = assign(step, {
						count: 0,
						avgTime: 0,
						minTime: Infinity,
						maxTime: 0,
						totalTime: 0
					});
					forEach(data, function (byProcessor) {
						byProcessor = byProcessor.processing;
						step.count += byProcessor.count;
						step.minTime = Math.min(byProcessor.minTime, step.minTime);
						step.maxTime = Math.max(byProcessor.maxTime, step.maxTime);
						step.totalTime += byProcessor.totalTime;
					});
					step.avgTime = getDurationDaysHours(step.totalTime / step.count);
					step.minTime = getDurationDaysHours(step.minTime);
					step.maxTime = getDurationDaysHours(step.maxTime);
				});

				// TODO: Rely on businessProcess not steps data below
				var total, processingTotal, correctionTotal, correctionByUsers;
				correctionTotal         = result.all.correction;
				correctionTotal.label   = _("Total correcting time");
				correctionByUsers       = result.all.correction;
				correctionByUsers.label = _("Corrections by the users");
				processingTotal         = result.all.processing;
				processingTotal.label   = _("Total process without corrections");

				total                   = {};
				total.label             = _("Total process");
				total.count = processingTotal.count;
				total.totalTime = processingTotal.totalTime + correctionTotal.totalTime;
				total.minTime = processingTotal.minTime;
				total.maxTime = processingTotal.maxTime;
				total.avgTime = total.totalTime / total.count;

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
						if (!totalItem.count) {
							totalItem = assign(totalItem, getEmptyResult());
						}
						inserts.data.push(totalItem);
					}
				);

				return inserts.data.map(function (row) {
					return [
						row.label,
						row.count,
						row.avgTime,
						row.minTime,
						row.maxTime
					].join();
				}).join('\n');
			});
		}
	};
};
