'use strict';

var db = require('mano').db

  , FieldsSection;

require('dbjs-ext/string/string-line')(db);

FieldsSection = module.exports = db.Object.extend('FieldsSection', {
	caption: { type: db.StringLine, required: true },
	fields: { type: db.StringLine, required: true, multiple: true },
	order: { type: db.Number, value: 0 },
	target: { type: db.StringLine }
});

FieldsSection.prototype.define('sections',
	{ type: FieldsSection, multiple: true });

db.User.define('fieldSections', { type: FieldsSection, multiple: true });
db.DocumentRequest.define('fieldSections',
	{ type: FieldsSection, multiple: true });
