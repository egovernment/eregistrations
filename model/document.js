// Document abstraction

'use strict';

var memoize          = require('memoizee/plain')
  , validDb          = require('dbjs/valid-dbjs')
  , defineStringLine = require('dbjs-ext/string/string-line')
  , defineFile       = require('./file')
  , defineStatusLog  = require('./status-log');

module.exports = memoize(function (db) {
	var StringLine, File;
	validDb(db);
	StringLine = defineStringLine(db);
	File = defineFile(db);
	db.Object.extend('Document', {
		files: { type: db.Object, nested: true },
		label: { type: StringLine, value: function () {
			return this.constructor.label;
		} },
		legend: { type: StringLine, value: function () {
			return this.constructor.legend;
		} },
		uniqueKey: { type: StringLine, value: function () { return this.key; } },
		orderedFiles: { type: File, multiple: true, value: function (_observe) {
			var files = [];
			_observe(this.files, true).forEach(function (file) {
				if (!_observe(file._path)) return;
				files.push(file);
			});
			return files.sort(function (a, b) {
				return a.getDescriptor('name')._lastOwnModified_ -
					b.getDescriptor('name')._lastOwnModified_;
			});
		} }
	}, {
		label: { type: StringLine, required: true },
		legend: { type: StringLine, required: true },
		abbr: { type: StringLine, required: true }
	});

	db.Document.prototype.files._descriptorPrototype_.type   = File;
	db.Document.prototype.files._descriptorPrototype_.nested = true;

	defineStatusLog(db.Document);

	return db.Document;
}, { normalizer: require('memoizee/normalizers/get-1')() });
