'use strict';

var mongo    = require('../mongo-db')
  , deferred = require('deferred');

module.exports = function () {
	mongo.connect()(function (db) {
		var collection = db.collection('rejectionReasons');
		// setup rejectionReasonsConcat, were there is none
		return collection.find({ rejectionReasonsConcat:
			{ $exists: false } }).toArray().then(function (rows) {
			return deferred.map(rows, function (row) {
				return collection.update({ _id: row._id }, {
					$set: { rejectionReasonsConcat: row.rejectionReasons.map(
						function (reason) {
							if (reason.value) {
								return reason.value;
							}
							return reason.types.join('');
						}
					).join('')
						}
				});
			});
		}).then(function () {
			return collection.aggregate([
				{
					$group: {
						_id: {
							date: '$date.date',
							rejectionReasonsConcat: '$rejectionReasonsConcat'
						},
						count: {
							$sum: 1
						}
					}
				}
			]).toArray();
		}).then(function (result) {
			return deferred.map(result, function (item) {
				if (item.count <= 1) return;
				return collection.update({ 'date.date': item._id.date,
					rejectionReasonsConcat: item._id.rejectionReasonsConcat
					},
					{ $set: { occurrencesCount: item.count } });
			});
		});
	}).done(null, function (err) {
		console.log(err);
	});
};
