'use strict';

var memoize                 = require('memoizee/plain')
  , validDb                 = require('dbjs/valid-dbjs')
  , defineStringLine        = require('dbjs-ext/string/string-line')
  , defineFormSectionBase   = require('./form-section-base')
  , defineFormTabularEntity = require('./form-tabular-entity');

module.exports = memoize(function (db) {
	var StringLine, FormSectionBase, FormTabularEntity;
	validDb(db);
	StringLine        = defineStringLine(db);
	FormSectionBase   = defineFormSectionBase(db);
	FormTabularEntity = defineFormTabularEntity(db);
	return FormSectionBase.extend('FormEntitiesTable', {
		generateFooter: { type: db.Function }
	}, {
		actionUrl: { required: false },
		baseUrl: { type: StringLine, required: true },
		propertyName: { type: StringLine, required: true },
		entityTitleProperty: { type: StringLine, required: true },
		entities: { type: FormTabularEntity, multiple: true, unique: true }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
