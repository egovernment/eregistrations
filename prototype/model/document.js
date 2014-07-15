// Document abstraction

'use strict';

var db         = require('mano').db
  , StringLine = require('dbjs-ext/string/string-line')(db);

module.exports = db.Object.extend('Document', {}, {
	label: { type: StringLine, required: true },
	abbr: { type: StringLine, required: true }
});
