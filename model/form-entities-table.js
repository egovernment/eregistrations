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
		status: { value: function () {
			var Type, statusSum;
			statusSum = 0;
			Type = this.master.getDescriptor(this.constructor.propertyName).type;
			Type.prototype.formSections.forEach(function (section) {
				if (!section) {
					return;
				}
				statusSum += section._status;
			});

			return statusSum / Type.prototype.formSections.size;
		} }
	}, {
		actionUrl: { required: false },
		baseUrl: { type: StringLine, required: true },
		propertyName: { type: StringLine, required: true },
		entityTitleProperty: { type: StringLine, required: true },
		entities: { type: FormTabularEntity, multiple: true, unique: true },
		generateFooter: { type: db.Function }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
