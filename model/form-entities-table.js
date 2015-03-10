'use strict';

var _                       = require('mano').i18n.bind("Model: Form Entities Table")
  , memoize                 = require('memoizee/plain')
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
			entityObjects = this.master.resolveSKeyPath(this.constructor.propertyName, _observe);
			if (!entityObjects) {
				return 0;
			}
			entityObjects = entityObjects.value;
			entityObjects.forEach(function (entityObject) {
				var resolved = entityObject.resolveSKeyPath(key, _observe);
				if (!resolved) {
					return;
				}
				statusSum += _observe(resolved.observable);
			});
			return !_observe(entityObjects._size) ? 1 : statusSum / entityObjects.size;
		} },
		weight: { value: function (_observe) {
			var entityObjects, weightTotal, key;
			weightTotal = 0;
			key = this.constructor.sectionProperty + 'Weight';
			entityObjects = this.master.resolveSKeyPath(this.constructor.propertyName, _observe);
			if (!entityObjects) {
				return 0;
			}
			entityObjects = entityObjects.value;
			entityObjects.forEach(function (entityObject) {
				var resolved = entityObject.resolveSKeyPath(key, _observe);
				if (!resolved) {
					return;
				}
				weightTotal += _observe(resolved.observable);
			});
			return !_observe(entityObjects._size) ? 1 : weightTotal;
		} }
	}, {
		actionUrl: { required: false },
		baseUrl: { type: StringLine, required: true },
		propertyName: { type: StringLine, required: true },
		entityTitleProperty: { type: StringLine, required: true },
		entities: { type: FormTabularEntity, multiple: true, unique: true },
		generateFooter: { type: db.Function },
		sectionProperty: { type: StringLine, required: true },
		onEmptyMessage: { type: StringLine, value: _("There are no elements added at the moment.") }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
