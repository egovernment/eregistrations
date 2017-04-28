'use strict';

var mongo    = require('../mongo-db')
  , deferred = require('deferred');

module.exports = (function () {
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
			console.log('WILL AGGREAGATE');
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
			console.log('YUPI KA..........', result);
		});
	}).done(null, function (err) {
		console.log(err);
	});
}());
