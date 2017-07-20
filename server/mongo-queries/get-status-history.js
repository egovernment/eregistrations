'use strict';

var db                  = require('mano').db
  , capitalize          = require('es5-ext/string/#/capitalize')
  , mongo               = require('../mongo-db')
  , resolveFullStepPath = require('../../utils/resolve-processing-step-full-path');

exports.fullItemsThreshold = 1485907200000; // TS in milliseconds of introduction of statusHistory

var queryCriteria = function (query) {
	var criteria = {}, queryDate = {}, dateFrom = Number(db.Date(query.dateFrom || 0));
	if (query.onlyFullItems) {
		dateFrom = Math.max(dateFrom, exports.fullItemsThreshold);
	}
	if (dateFrom) queryDate.$gte = dateFrom;
	if (query.dateTo) queryDate.$lte = Number(db.Date(query.dateTo));
	if (Object.keys(queryDate).length > 0) criteria["date.date"] = queryDate;
	if (query.service) {
		criteria["service.type"] = 'BusinessProcess' + capitalize.call(query.service);
	}
	if (query.excludeFrontDesk) {
		criteria['processingStep.path'] = { $not: /frontDesk/ };
	}
	if (query.steps && query.steps.length) {
		criteria.$or = [];
		query.steps.forEach(function (step) {
			criteria.$or.push({
				'processingStep.path': step
			});
		});
	}
	if (query.step) {
		criteria['processingStep.path'] = { $regex: new RegExp(resolveFullStepPath(query.step + '$')) };
	}

	return criteria;
};

exports.find = function (query/*, options */) {
	var portion = Object(arguments[1])
	  , criteria = queryCriteria(query), limit, offset;

	offset = portion.offset || 0;
	limit = portion.limit || 0;

	return mongo.connect()(function (db) {
		return db.collection('processingStepsHistory')
			.find(criteria)
			.sort(query.sort)
			.skip(offset).limit(limit).toArray();
	});
};

exports.count = function (query) {
	var criteria = queryCriteria(query);
	return mongo.connect()(function (db) {
		return db.collection('processingStepsHistory')
			.find(criteria).count();
	});
};

exports.group = function (groupBy) {
	return mongo.connect()(function (db) {
		return db.collection('processingStepsHistory')
			.aggregate(groupBy).toArray();
	});
};
