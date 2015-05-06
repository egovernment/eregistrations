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
			var entityObjects, statusSum, statusKey, weightKey;
			statusSum = 0;
			statusKey = this.constructor.sectionProperty + 'Status';
			weightKey = this.constructor.sectionProperty + 'Weight';
			entityObjects = this.master.resolveSKeyPath(this.constructor.propertyName, _observe);
			if (!entityObjects) {
				return 0;
			}
			entityObjects = entityObjects.value;
			entityObjects.forEach(function (entityObject) {
				var resolvedStatus, resolvedWeight;
				resolvedStatus = entityObject.resolveSKeyPath(statusKey, _observe);
				resolvedWeight = entityObject.resolveSKeyPath(weightKey, _observe);
				if (!resolvedStatus || !resolvedWeight) {
					return;
				}
				statusSum += (_observe(resolvedStatus.observable) * _observe(resolvedWeight.observable));
			});
			if (!this.weight) return 1;
			return statusSum / this.weight;
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
			return !_observe(entityObjects._size) ? 0 : weightTotal;
		} },
		lastEditDate: {
			value: function (_observe) {
				var res = 0, entityObjects, sectionKey;
				entityObjects = this.master.resolveSKeyPath(this.constructor.propertyName, _observe);
				sectionKey = this.constructor.sectionProperty;
				if (!entityObjects) {
					return 0;
				}
				entityObjects = entityObjects.value;
				entityObjects.forEach(function (entityObject) {
					var sections;
					sections = entityObject.resolveSKeyPath(sectionKey, _observe);
					sections = sections.object[sections.key];
					sections.forEach(function (section) {
						if (_observe(section._editDate) > res) res = section.editDate;
					});
				});

				return res / 1000;
			}
		}
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
