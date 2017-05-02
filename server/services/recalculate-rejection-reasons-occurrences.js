'use strict';

var mongo    = require('../mongo-db')
  , Set      = require('es6-set')
  , deferred = require('deferred');

module.exports = function () {
	mongo.connect()(function (db) {
		var collection = db.collection('rejectionReasons');
		// setup rejectionReasonsConcat, were there is none
		return collection.find({ rejectionReasonsConcat: null }).toArray().then(function (rows) {
			return deferred.map(rows, function (row) {
				var result = [];
				row.rejectionReasons.forEach(
					function (reason) {
						if (reason.value) {
							result.push(reason.value);
							return;
						}
						Array.prototype.push.apply(result, reason.types);
					}
				);
				return collection.update({ _id: row._id }, {
					$set: { rejectionReasonsConcat: Array.from(new Set(result)).sort().join('') }
				});
			});
		});
	}).done(null, function (err) {
		console.log(err);
	});
};
