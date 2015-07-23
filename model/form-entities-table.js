/** This section should be used as a super class for sections which create tables of entities.
 * Those entities are for example partners and branches.
 */

'use strict';

var _                       = require('mano').i18n.bind("Model: Form Entities Table")
  , memoize                 = require('memoizee/plain')
  , validDb                 = require('dbjs/valid-dbjs')
  , defineStringLine        = require('dbjs-ext/string/string-line')
  , defineFormSectionBase   = require('./form-section-base')
  , defineFormTabularEntity = require('./form-tabular-entity')
  , defineUInteger          = require('dbjs-ext/number/integer/u-integer')
  , defineProgressRule      = require('./lib/progress-rule')
  , defineProgressRules     = require('./lib/progress-rules');

module.exports = memoize(function (db) {
	var FormEntitiesTable, StringLine, FormSectionBase, FormTabularEntity, UInteger
	  , ProgressRule, ProgressRules;
	validDb(db);
	StringLine        = defineStringLine(db);
	FormSectionBase   = defineFormSectionBase(db);
	FormTabularEntity = defineFormTabularEntity(db);
	UInteger          = defineUInteger(db);
	ProgressRule      = defineProgressRule(db);
	ProgressRules     = defineProgressRules(db);
	FormEntitiesTable = FormSectionBase.extend('FormEntitiesTable', {
		progressRules: { type: ProgressRules, nested: true },
		min: { type: UInteger },
		max: { type: UInteger },
		status: {
			value: function (_observe) {
				var weight = 0, progress = 0;

				// Take into account resolvent
				progress += this.resolventStatus * this.resolventWeight;
				weight += this.resolventWeight;

				// If section is unresolved, exit just with resolvent
				if (this.isUnresolved) {
					if (!weight) return 1;
					return progress / weight;
				}

				// Take into account all rules
				progress += _observe(this.progressRules._progress) * _observe(this.progressRules._weight);
				weight += this.progressRules.weight;

				if (!weight) return 1;
				return progress / weight;
			}
		},
		weight: { value: function (_observe) {
			if (this.isUnresolved) {
				return this.resolventWeight;
			}
			return _observe(this.progressRules._weight) + this.resolventWeight;
		} },
		getWeightByEntity: {
			type: db.Function,
			value: function (entityObject, _observe) {
				if (this.sectionProperty === 'dataForms') {
					var dataForms = entityObject.resolveSKeyPath(this.sectionProperty, _observe);
					if (!dataForms) {
						return 0;
					}
					return _observe(dataForms.object.dataForms._weight);
				}
				// for backwards compatibility
				var resolved = entityObject.resolveSKeyPath(this.sectionProperty + 'Weight', _observe);
				if (!resolved) {
					return 0;
				}
				return _observe(resolved.observable);
			}
		},
		// returns a set of all currently setup entities, resolves some new / old model logic
		entitiesSet: {
			multiple: true,
			value: function (_observe) {
				var entityObjects = this.master.resolveSKeyPath(this.propertyName, _observe);
				if (!entityObjects) {
					return;
				}
				entityObjects = entityObjects.value;
				if (entityObjects instanceof this.database.NestedMap) {
					entityObjects = entityObjects.ordered;
				}
				return _observe(entityObjects);
			}
		},
		lastEditStamp: {
			value: function (_observe) {
				var res = 0, entityObjects, sectionKey, resolvent, resolventLastModified;
				entityObjects = this.entitiesSet;
				sectionKey = this.sectionProperty;
				if (this.resolventProperty) {
					resolvent = _observe(this.master.resolveSKeyPath(this.resolventProperty).observable);
					resolventLastModified = resolvent ? resolvent.lastModified : 0;
				}
				if (!entityObjects) {
					return resolventLastModified;
				}
				entityObjects.forEach(function (entityObject) {
					var sections;
					sections = entityObject.resolveSKeyPath(sectionKey, _observe);
					sections = sections.object[sections.key];
					if (sectionKey === 'dataForms') {
						sections = sections.applicable;
					}
					sections.forEach(function (section) {
						if (_observe(section._lastEditStamp) > res) res = section.lastEditStamp;
					});
				});
				if (resolventLastModified > res) res = resolventLastModified;

				return res;
			}
		},
		actionUrl: { required: false },
		// The base url around which links and postButtons to entities will be created.
		// By convention following links to following urls will be created:
		// section.baseUrl + '-add',
		// section.baseUrl + '/' + <entityId>.
		// By convention url to delete an entity will be created:
		// section.baseUrl + '/' + <entityId> + '/delete'
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
		// you should do it on section.generateFooter
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

	FormEntitiesTable.prototype.progressRules.map.define('entities', {
		type: ProgressRule,
		nested: true
	});
	FormEntitiesTable.prototype.progressRules.map.get('entities').setProperties({
		message: _("Some of the added items are incomplete."),
		progress: function (_observe) {
			var statusSum, tabularSection, statusKey, weightKey, i, dataForms;
			i = 0;
			statusSum = 0;
			tabularSection = this.owner.owner.owner;
			statusKey = tabularSection.sectionProperty + 'Status';
			weightKey = tabularSection.sectionProperty + 'Weight';
			if (!_observe(tabularSection._entitiesSet)) {
				return 0;
			}
			tabularSection.entitiesSet.some(function (entityObject) {
				var resolvedStatus, resolvedWeight;
				i++;
				if (tabularSection.sectionProperty === 'dataForms') {
					dataForms = entityObject.resolveSKeyPath(tabularSection.sectionProperty, _observe);
					if (!dataForms) {
						return;
					}
					resolvedStatus = _observe(dataForms.value._progress);
					resolvedWeight = _observe(dataForms.value._weight);
				} else {
					resolvedStatus = entityObject.resolveSKeyPath(statusKey, _observe);
					resolvedWeight = entityObject.resolveSKeyPath(weightKey, _observe);
					if (!resolvedStatus || !resolvedWeight) {
						return;
					}
					resolvedStatus = _observe(resolvedStatus.observable);
					resolvedWeight = _observe(resolvedWeight.observable);
				}
				if (tabularSection.max && (i > tabularSection.max)) {
					return true;
				}
				statusSum += (resolvedStatus * resolvedWeight);
			});
			return statusSum / this.weight;
		},
		weight: function (_observe) {
			var weightTotal, i, tabularSection;
			weightTotal = 0;
			i = 0;
			tabularSection = this.owner.owner.owner;
			if (!_observe(tabularSection._entitiesSet)) {
				return 0;
			}
			tabularSection.entitiesSet.some(function (entityObject) {
				++i;
				if (_observe(tabularSection._max) && (i > tabularSection.max)) {
					return true;
				}
				weightTotal += tabularSection.getWeightByEntity(entityObject, _observe);
			});

			return weightTotal;
		}
	});

	FormEntitiesTable.prototype.progressRules.map.define('min', {
		type: ProgressRule,
		nested: true
	});
	FormEntitiesTable.prototype.progressRules.map.get('min').setProperties({
		message: _("To few items added."),
		progress: function () {
			return this.weight ? 0 : 1;
		},
		weight: function (_observe) {
			var entityObjects, mockWeight
		  , objectsType, tabularSection, mockWeightObject;
			tabularSection = this.owner.owner.owner;
			if (!_observe(tabularSection._min)) {
				return 0;
			}
			entityObjects = this.master.resolveSKeyPath(tabularSection.propertyName, _observe);
			if (!entityObjects) {
				return 0;
			}
			objectsType = entityObjects.descriptor.type;
			entityObjects = entityObjects.value;
			if (entityObjects instanceof this.database.NestedMap) {
				entityObjects = entityObjects.ordered;
				mockWeightObject = entityObjects.map.get('testOnlyDontUseMe');
			} else {
				mockWeightObject = objectsType.prototype;
			}
			_observe(entityObjects);
			if (entityObjects.size < tabularSection._min) {
				mockWeight = tabularSection.getWeightByEntity(mockWeightObject, _observe);

				// we assume that each potential entity has the same weight as prototype
				return mockWeight * (tabularSection.min - entityObjects.size);
			}
			return 0;
		}
	});

	FormEntitiesTable.prototype.progressRules.map.define('max', {
		type: ProgressRule,
		nested: true
	});
	FormEntitiesTable.prototype.progressRules.map.get('max').setProperties({
		message: _("To many items added."),
		progress: function () {
			return this.weight ? 0 : 1;
		},
		weight: function (_observe) {
			var entityObjects, tabularSection;
			tabularSection = this.owner.owner.owner;
			if (!_observe(tabularSection._max)) {
				return 0;
			}
			entityObjects = this.master.resolveSKeyPath(tabularSection.propertyName, _observe);
			if (!entityObjects) {
				return 0;
			}
			entityObjects = entityObjects.value;
			if (entityObjects instanceof this.database.NestedMap) {
				entityObjects = entityObjects.ordered;
			}
			_observe(entityObjects);
			if (tabularSection.max && (entityObjects.size > tabularSection.max)) {
				return entityObjects.size - tabularSection.max;
			}
			return 0;
		}
	});

	return FormEntitiesTable;
}, { normalizer: require('memoizee/normalizers/get-1')() });
