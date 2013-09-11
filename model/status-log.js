'use strict';

var Db         = require('dbjs')
  , StringLine = require('dbjs-ext/string/string-line');

exports = module.exports = Db.Object.create('StatusLog', {
	label: StringLine.required,
	time: Db.DateTime.required,
	text: Db.String.required
});

Db.User.prototype.set('statusLog', exports.rel({ multiple: true }));
