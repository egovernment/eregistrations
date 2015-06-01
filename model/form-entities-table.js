/**
	* This section should be used as a super class for sections which create tables of entities.
	* Those entities are for example partners and branches.
	*/

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
						if (_observe(section._lastEditDate) > res) res = section.lastEditDate;
					});
				});

				return res;
			}
		}
	}, {
		actionUrl: { required: false },
		// The base url around which links and postButtons to entities will be created.
		// By convention following links to following urls will be created:
		// section.constructor.baseUrl + '-add',
		// section.constructor.baseUrl + '/' + <entityId>.
		// By convention url to delete an entity will be created:
		// section.constructor.baseUrl + '/' + <entityId> + '/delete'
		baseUrl: { type: StringLine, required: true },
		// The name of section's master property to which the section refers i.e: partners
		propertyName: { type: StringLine, required: true },
		// The name of property of entity from which the header will be taken i.e:
		// name (the header will be taken from partner.name)
		entityTitleProperty: { type: StringLine, required: true },
		// Set of objects of type FormTabularEntity which represent the table columns
		entities: { type: FormTabularEntity, multiple: true, unique: true },
		// A placeholder for custom footer definition.
		// If you want to create custom definition of footer,
		// you should do it on section.constructor.generateFooter
		// (this must be ecmaScript, not dbjs definition, so place it in view/dbjs).
		// Your custom generateFooter function will receive one argument
		// (with the value of propertyName of section's master i.e. the partners set of given user).
		generateFooter: { type: db.Function },
		// The name of the property on which the sections collection has been defined on the entity.
		// For example formSections.
		sectionProperty: { type: StringLine, required: true },
		// The text of message displayed when there are no entities.
		onEmptyMessage: { type: StringLine, value: _("There are no elements added at the moment.") }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
