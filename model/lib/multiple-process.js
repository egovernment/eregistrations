// MultipleProcess model
// An abstract class that allows us to group some atomic process related entities
// Like: registrations, requirements or processingSteps

'use strict';

var memoize  = require('memoizee/plain')
  , ensureDb = require('dbjs/valid-dbjs');

module.exports = memoize(function (db/*, options*/) {
	var MultipleProcess = ensureDb(db).Object.extend('MultipleProcess', {
		map: { type: db.Object, nested: true },
		applicable: { type: db.Object, multiple: true, value: function (_observe) {
			var result = [];
			this.map.forEach(function (entity) {
				var isApplicable = entity._get ? _observe(entity._isApplicable) : entity.isApplicable;
				if (isApplicable) result.push(entity);
			});
			return result;
		} }
	});
	MultipleProcess.prototype.map._descriptorPrototype_.type = db.Object;
	return MultipleProcess;
}, { normalizer: require('memoizee/normalizers/get-1')() });
