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
  , defineNestedMap         = require('./lib/nested-map');

module.exports = memoize(function (db) {
	var StringLine, FormSectionBase, FormTabularEntity, UInteger;
	validDb(db);
	StringLine        = defineStringLine(db);
	FormSectionBase   = defineFormSectionBase(db);
	FormTabularEntity = defineFormTabularEntity(db);
	UInteger          = defineUInteger(db);
	defineNestedMap(db);
	return FormSectionBase.extend('FormEntitiesTable', {
		min: { type: UInteger },
		max: { type: UInteger },
		status: { value: function (_observe) {
			var entityObjects, statusSum, statusKey, weightKey, isResolventExcluded, resolved;
			statusSum = 0;
			statusKey = this.sectionProperty + 'Status';
			weightKey = this.sectionProperty + 'Weight';
			if (this.resolventProperty) {
				resolved = this.master.resolveSKeyPath(this.resolventProperty, _observe);
				if (!resolved) {
					return 0;
				}
				isResolventExcluded = this.isPropertyExcludedFromStatus(resolved, _observe);
				if (_observe(resolved.observable) !== _observe(this.resolventValue)) {
					if (isResolventExcluded) return 1;
					if (resolved.descriptor.multiple) {
						if (_observe(resolved.observable).size) return 1;
					} else {
						if (_observe(resolved.observable) != null) return 1;
					}
					return 0;
				}
				if (!isResolventExcluded) {
					++statusSum;
				}
			}
			entityObjects = this.master.resolveSKeyPath(this.propertyName, _observe);
			if (!entityObjects) {
				return 0;
			}
			entityObjects = entityObjects.value;
			if (entityObjects instanceof this.database.NestedMap) {
				entityObjects = entityObjects.ordered;
			}
			_observe(entityObjects);
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
			var entityObjects, weightTotal, key, getWeightByEntity, protoWeight, i,
				isResolventExcluded, resolved, objectsType;
			weightTotal = 0;
			i = 0;
			key = this.sectionProperty + 'Weight';
			if (this.resolventProperty) {
				resolved = this.master.resolveSKeyPath(this.resolventProperty, _observe);
				if (!resolved) {
					return 0;
				}
				isResolventExcluded = this.isPropertyExcludedFromStatus(resolved, _observe);
				if (_observe(resolved.observable) !== _observe(this.resolventValue)) {
					return isResolventExcluded ? 0 : 1;
				}
				if (!isResolventExcluded) {
					++weightTotal;
				}
			}
			getWeightByEntity = function (entityObject) {
				var resolved = entityObject.resolveSKeyPath(key, _observe);
				if (!resolved) {
					return 0;
				}
				return _observe(resolved.observable);
			};
			entityObjects = this.master.resolveSKeyPath(this.propertyName, _observe);
			if (!entityObjects) {
				return 0;
			}
			objectsType = entityObjects.descriptor.type;
			entityObjects = entityObjects.value;
			if (entityObjects instanceof this.database.NestedMap) {
				entityObjects = entityObjects.ordered;
			}
			_observe(entityObjects);
			entityObjects.some(function (entityObject) {
				++i;
				if (this.max && (i > this.max)) {
					// we add to weight in order to make status 1 unreachable
					weightTotal += (entityObjects.size - this.max);
					return true;
				}
				weightTotal += getWeightByEntity(entityObject);
			}, this);
			if (_observe(entityObjects._size) < this.min) {
				protoWeight = getWeightByEntity(objectsType.prototype);

				// we assume that each potential entity has the same weight as prototype
				weightTotal += (protoWeight * (this.min - entityObjects.size));
			}

			return weightTotal;
		} },
		lastEditStamp: {
			value: function (_observe) {
				var res = 0, entityObjects, sectionKey, resolvent, resolventLastModified;
				entityObjects = this.master.resolveSKeyPath(this.propertyName, _observe);
				sectionKey = this.sectionProperty;
				if (this.resolventProperty) {
					resolvent = _observe(this.master.resolveSKeyPath(this.resolventProperty).observable);
					resolventLastModified = resolvent ? resolvent.lastModified : 0;
				}
				if (!entityObjects) {
					return resolventLastModified;
				}
				entityObjects = entityObjects.value;
				if (entityObjects instanceof this.database.NestedMap) {
					entityObjects = entityObjects.ordered;
				}
				_observe(entityObjects);
				entityObjects.forEach(function (entityObject) {
					var sections;
					sections = entityObject.resolveSKeyPath(sectionKey, _observe);
					sections = sections.object[sections.key];
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
}, { normalizer: require('memoizee/normalizers/get-1')() });
