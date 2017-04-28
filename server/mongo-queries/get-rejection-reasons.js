'use strict';

var db         = require('mano').db
  , capitalize = require('es5-ext/string/#/capitalize')
  , mongo      = require('../mongo-db');

var queryCriteria = function (query) {
	var criteria = {}, queryDate = {};
	if (query.dateFrom) queryDate.$gte = Number(db.Date(query.dateFrom));
	if (query.dateTo) queryDate.$lte = Number(db.Date(query.dateTo));
	if (Object.keys(queryDate).length > 0) criteria["date.date"] = queryDate;
	if (query.service) {
		criteria["service.type"] = 'BusinessProcess' + capitalize.call(query.service);
	}
	if (query.rejectionReasonType) criteria.rejectionType = query.rejectionReasonType;
	return criteria;

};

exports.find = function (query/*, options */) {
	var offset = arguments[1] || 0
	  , limit = arguments[2] || 0
	  , criteria = queryCriteria(query);

	return mongo.connect()(function (db) {
		return db.collection('rejectionReasons')
			.find(criteria)
			.skip(offset).limit(limit).toArray();
	});
};

exports.count = function (query) {
	var criteria = queryCriteria(query);
	return mongo.connect()(function (db) {
		return db.collection('rejectionReasons')
			.find(criteria).count();
	});
};
