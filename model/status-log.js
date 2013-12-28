'use strict';

var db = require('mano').db;

require('dbjs-ext/string/string-line')(db);

exports = module.exports = db.Object.extend('StatusLog', {
	label: { type: db.StringLine, required: true },
	time: { type: db.DateTime, required: true },
	official: { type: db.User },
	text: { type: db.String, required: true }
});

db.User.prototype.define('statusLog', { type: exports, multiple: true });
