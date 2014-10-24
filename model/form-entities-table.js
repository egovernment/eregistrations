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
		status: { value: function (_observe) {
			var self, entityObjects, statusSum;
			self = this;
			statusSum = 0;
			entityObjects = this.master.resolveSKeyPath(this.constructor.propertyName).value;
			entityObjects.forEach(function (entityObject) {
				statusSum +=
					_observe(entityObject.resolveSKeyPath(self.constructor.sectionProperty + 'Status')
						.observable);
			});

			return statusSum / _observe(entityObjects._size);
		} }
	}, {
		actionUrl: { required: false },
		baseUrl: { type: StringLine, required: true },
		propertyName: { type: StringLine, required: true },
		entityTitleProperty: { type: StringLine, required: true },
		entities: { type: FormTabularEntity, multiple: true, unique: true },
		generateFooter: { type: db.Function },
		sectionProperty: { type: StringLine, required: true }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
