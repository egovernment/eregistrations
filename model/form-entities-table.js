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
			var entityObjects, statusSum, key;
			statusSum = 0;
			key = this.constructor.sectionProperty + 'Status';
			entityObjects = this.master.resolveSKeyPath(this.constructor.propertyName).value;
			entityObjects.forEach(function (entityObject) {
				statusSum +=
					_observe(entityObject.resolveSKeyPath(key)
						.observable);
			}, this);

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
