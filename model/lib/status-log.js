'use strict';

var memoize          = require('memoizee/plain')
  , defineUser       = require('../user/base')
  , defineStringLine = require('dbjs-ext/string/string-line');

module.exports = memoize(function (db) {
	var StringLine = defineStringLine(db)
	  , User       = defineUser(db);

	return db.Object.extend('StatusLog', {
		label: { type: StringLine, required: true },
		time: { type: db.DateTime, required: true },
		official: { type: User },
		officialFullName: { type: StringLine },
		text: { type: db.String, required: true },
		toJSON: { value: function (ignore) {
			return {
				label: this.getOwnDescriptor('label').valueToJSON(),
				time: this.getOwnDescriptor('time').valueToJSON(),
				official: this.getOwnDescriptor('official').valueToJSON(),
				officialFullName: this.getOwnDescriptor('officialFullName').valueToJSON(),
				text: this.getOwnDescriptor('text').valueToJSON()
			};
		} }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
