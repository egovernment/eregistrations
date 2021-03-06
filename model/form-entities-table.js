/** This section should be used as a super class for sections which create tables of entities.
 * Those entities are for example partners and branches.
 */

'use strict';

var _                       = require('mano').i18n.bind("Model: Form Entities Table")
  , memoize                 = require('memoizee/plain')
  , validDb                 = require('dbjs/valid-dbjs')
  , defineStringLine        = require('dbjs-ext/string/string-line')
  , defineUInteger          = require('dbjs-ext/number/integer/u-integer')
  , defineFormSectionBase   = require('./form-section-base')
  , defineFormTabularEntity = require('./form-tabular-entity')
  , defineProgressRule      = require('./lib/progress-rule');

module.exports = memoize(function (db) {
	var FormEntitiesTable, StringLine, FormSectionBase, FormTabularEntity, UInteger, ProgressRule;
	validDb(db);
	StringLine        = defineStringLine(db);
	FormSectionBase   = defineFormSectionBase(db);
	FormTabularEntity = defineFormTabularEntity(db);
	UInteger          = defineUInteger(db);
	ProgressRule      = defineProgressRule(db);
	FormEntitiesTable = FormSectionBase.extend('FormEntitiesTable', {
		min: { type: UInteger },
		max: { type: UInteger },
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
				var entityObjects = this.propertyMaster.resolveSKeyPath(this.propertyName, _observe);
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
				var res = 0
				  , sectionProperty = this.sectionProperty
				  , entitiesSet  = this.entitiesSet
				  , resolvedResolvent;

				if (this.resolventProperty) {
					resolvedResolvent = this.ensureResolvent(_observe);

					if (!resolvedResolvent) return;

					res = _observe(resolvedResolvent.object['_' + resolvedResolvent.key]._lastModified);
					if (res < 1e6) res = 0; // Ignore model stamps
				}

				if (entitiesSet) {
					entitiesSet.forEach(function (entityObject) {
						var sections;

						sections = entityObject.resolveSKeyPath(sectionProperty, _observe);
						sections = sections.object[sections.key];

						if (sectionProperty === 'dataForms') {
							sections = sections.applicable;
						}

						sections.forEach(function (section) {
							if (_observe(section._lastEditStamp) > res) res = section.lastEditStamp;
						});
					});
				}
				// We need to check cardinalPropertyKey property in case of NestedMap entities,
				// otherwise deleting them will be omitted lastEditStamp calculation
				var entityObjects = this.propertyMaster.resolveSKeyPath(this.propertyName, _observe);
				if (!entityObjects) {
					return res;
				}
				entityObjects = entityObjects.value;
				if (entityObjects instanceof this.database.NestedMap) {
					var cardinalPropertyPath = entityObjects.cardinalPropertyKey;
					entityObjects.map.forEach(function (entity) {
						var resolved = entity.resolveSKeyPath(cardinalPropertyPath, _observe);
						if (!resolved) return;
						if (resolved.value == null) {
							var lastModified = resolved.observable.lastModified;
							if (lastModified < 1e6) lastModified = 0; // Ignore model stamps
							if (lastModified > res) res = lastModified;
						}
					});
				}

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
		onEmptyMessage: { type: StringLine, value: _("There are no elements added at the moment.") },
		propertyNamesDeep: {
			value: function () {
				if (this.resolventProperty) return [this.resolventProperty];
			}
		},
		hasDisplayableRuleDeep: {
			value: function (_observe) {
				if (_observe(this.progressRules.displayable._size) > 0) return true;

				return this.entitiesSet.some(function (child) {
					var sections;

					sections = child.resolveSKeyPath(this.sectionProperty, _observe);
					sections = sections.object[sections.key];

					if (this.sectionProperty === 'dataForms') {
						sections = sections.applicable;
					}

					return sections.some(function (section) {
						return (_observe(section._hasDisplayableRuleDeep));
					});
				}, this);
			}
		},
		hasMissingRequiredPropertyNamesDeep: {
			type: db.Boolean,
			value: function (_observe) {
				if (this.isUnresolved) {
					return this.resolventStatus < 1;
				}

				return this.entitiesSet.some(function (child) {
					var sections;

					sections = child.resolveSKeyPath(this.sectionProperty, _observe);
					sections = sections.object[sections.key];

					if (this.sectionProperty === 'dataForms') {
						sections = sections.applicable;
					}

					return sections.some(function (section) {
						return (_observe(section._hasMissingRequiredPropertyNamesDeep));
					});
				}, this);
			}
		},
		hasFilledPropertyNamesDeep: {
			value: function (_observe) {
				if (this.isResolventFilled(_observe)) return true;

				return this.entitiesSet.some(function (child) {
					var sections;

					sections = child.resolveSKeyPath(this.sectionProperty, _observe);
					sections = sections.object[sections.key];

					if (this.sectionProperty === 'dataForms') {
						sections = sections.applicable;
					}

					return sections.some(function (section) {
						return (_observe(section._hasFilledPropertyNamesDeep));
					});
				}, this);
			}
		},
		toJSON: { value: function (ignore) {
			var result = this.commonToJSON();
			if (this.resolventProperty) {
				result.fields = [this.propertyMaster.resolveSKeyPath(this.resolventProperty)
					.ownDescriptor.fieldToJSON()];
			}
			if (!this.isUnresolved) {
				var entities = [], data = this.entitiesSet;
				data.forEach(function (entity) {
					entities.push({
						name: entity.getBySKeyPath(this.entityTitleProperty),
						sections: entity.getBySKeyPath(this.sectionProperty).toJSON()
					});
				}, this);
				if (entities.length) result.entities = entities;
			}
			return result;
		} },
		toWebServiceJSON: {
			value: function (options) {
				var fields = {}, resolventDescriptor, sectionFields, wsValue, entityObjects
				  , isEntitiesNestedMap, entityFields, opts, includeFullMeta;
				opts = Object(options);
				includeFullMeta = opts.includeFullMeta;
				entityObjects = this.propertyMaster.resolveSKeyPath(this.propertyName);
				isEntitiesNestedMap = entityObjects.value instanceof this.database.NestedMap;
				fields[this.propertyName] = [];
				// entities container
				if (this.resolventProperty) {
					resolventDescriptor = this.master.resolveSKeyPath(this.resolventProperty).ownDescriptor;
					if (!resolventDescriptor.isValueEmpty()) {
						wsValue = resolventDescriptor.fieldToWebServiceJSON();
						fields[wsValue.name] = includeFullMeta ? wsValue : wsValue.value;
					}
				}
				if (!this.isUnresolved) {
					this.entitiesSet.forEach(function (entity) {
						entityFields  = {};
						entity.getBySKeyPath(this.sectionProperty).applicable.forEach(function (section) {
							sectionFields = section.toWebServiceJSON(opts);
							if (isEntitiesNestedMap) {
								var entityId = entity.__id__.split('/').pop();
								if (Array.isArray(sectionFields[Object.keys(sectionFields)[0]])) {
									entityFields[Object.keys(sectionFields)] =
										sectionFields[Object.keys(sectionFields)[0]];
									return;
								}
								while (sectionFields && Object.keys(sectionFields)[0] !== entityId) {
									sectionFields = sectionFields[Object.keys(sectionFields)[0]];
								}
								if (!sectionFields) return;

								entityFields.id = Object.keys(sectionFields)[0];
								Object.assign(entityFields, sectionFields[Object.keys(sectionFields)[0]]);
							} else { //old model
								entityFields = sectionFields;
							}
						}, this);
						fields[this.propertyName].push(entityFields);
					}, this);
				}

				return fields;
			}
		},
		toMetaDataJSON: {
			value: function (ignore) {
				var result = [], entityObjects, Item, isEntitiesNestedMap;
				entityObjects = this.propertyMaster.resolveSKeyPath(this.propertyName);
				isEntitiesNestedMap = entityObjects.value instanceof this.database.NestedMap;
				if (!isEntitiesNestedMap) return result;
				Item = entityObjects.value.getItemType();
				Item.prototype.getBySKeyPath(this.sectionProperty).map.forEach(function (section) {
					result = result.concat(section.toMetaDataJSON());
				});

				return result;
			}
		}
	});

	FormEntitiesTable.prototype.defineProperties({

		toWSSchema: {
			value: function (ignore) {
				if (typeof process === 'undefined') return;
				var entityObjects, Item, isEntitiesNestedMap, schema = { properties: {} }
				  , sectionSchema = {};
				schema.properties[this.propertyName] = {
					type: "array",
					items: { type: "object", properties: {}, dataForms: [] }
				};
				entityObjects = this.propertyMaster.resolveSKeyPath(this.propertyName);
				isEntitiesNestedMap = entityObjects.value instanceof this.database.NestedMap;
				if (!isEntitiesNestedMap) return schema;
				Item = entityObjects.value.getItemType();
				Item.prototype.getBySKeyPath(this.sectionProperty).map.forEach(function (section) {
					sectionSchema = section.toWSSchema();
					if (sectionSchema.dataForms) {
						//dataForms will have to be set via iteration because assign
						//will overwrite existing value of existing dataForms property.
						sectionSchema.dataForms.forEach(function (dataForm) {
							schema.properties[this.propertyName].items.dataForms.push(dataForm);
						}, this);
						delete sectionSchema.dataForms;
					}
					db.Object.deepAssign(schema.properties[this.propertyName].items, sectionSchema);
				}, this);
				return schema;
			}
		}
	});

	FormEntitiesTable.prototype.progressRules.map.define('entities', {
		type: ProgressRule,
		nested: true
	});
	FormEntitiesTable.prototype.progressRules.map.get('entities').setProperties({
		message: _("Some of the added items are incomplete"),
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
			if (!this.weight) return 1;
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

	FormEntitiesTable.prototype.progressRules.map.define('minMax', {
		type: ProgressRule,
		nested: true
	});

	FormEntitiesTable.prototype.progressRules.map.get('minMax').setProperties({
		minMessage: _("At least ${ min } items should be added"),
		maxMessage: _("No more than ${ max } items should be added"),
		minMaxDiffMessage: _("At least ${ min } and no more than ${ max } items should be added"),
		minMaxSameMessage: _("Exactly ${ max } items should be added"),
		getTranslations: function (options) {
			var tabularSection = this.owner.owner.owner;
			return { min: tabularSection._min, max: tabularSection._max };
		},
		message: function (_observe) {
			var tabularSection = this.owner.owner.owner, min, max;
			min = _observe(tabularSection._min);
			max = _observe(tabularSection._max);
			if (min && max) {
				return min === max ? this.minMaxSameMessage : this.minMaxDiffMessage;
			}
			if (min) {
				return this.minMessage;
			}
			return this.maxMessage;
		},
		progress: function () {
			return this.weight ? 0 : 1;
		},
		weight: function (_observe) {
			var tabularSection = this.owner.owner.owner, min, max;
			min = _observe(tabularSection._min);
			max = _observe(tabularSection._max);
			if (min && max) {
				return this.minWeight + this.maxWeight;
			}
			if (min) {
				return this.minWeight;
			}
			if (max) {
				return this.maxWeight;
			}
			return 0;
		},
		maxWeight: function (_observe) {
			var entityObjects, tabularSection;
			tabularSection = this.owner.owner.owner;
			if (!_observe(tabularSection._max)) {
				return 0;
			}
			entityObjects =
				tabularSection.propertyMaster.resolveSKeyPath(tabularSection.propertyName, _observe);
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
		},
		minWeight: function (_observe) {
			var entityObjects, mockWeight, objectsType, tabularSection, mockWeightObject;
			tabularSection = this.owner.owner.owner;
			if (!_observe(tabularSection._min)) {
				return 0;
			}
			entityObjects =
				tabularSection.propertyMaster.resolveSKeyPath(tabularSection.propertyName, _observe);
			if (!entityObjects) {
				return 0;
			}
			objectsType   = entityObjects.descriptor.type;
			entityObjects = entityObjects.value;
			if (entityObjects instanceof this.database.NestedMap) {
				mockWeightObject = entityObjects.map.get('testOnlyDontUseMe');
				entityObjects = entityObjects.ordered;
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

	return FormEntitiesTable;
}, { normalizer: require('memoizee/normalizers/get-1')() });
