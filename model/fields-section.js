'use strict';

var Db         = require('dbjs')
  , StringLine = require('dbjs-ext/string/string-line')
  , User       = require('../../../user/model/user')
  , FieldsSection;

FieldsSection = module.exports = Db.Object.create('FieldsSection', {
	caption: StringLine.required,
	fields: StringLine.rel({ required: true, multiple: true }),
	order: Db.Number.rel(0),
	target: StringLine
});

FieldsSection.prototype.set('sections', FieldsSection.rel({ multiple: true }));

User.set('fieldSections', FieldsSection.rel({ multiple: true }));
Db.DocumentRequest.set('fieldSections', FieldsSection.rel({ multiple: true }));
