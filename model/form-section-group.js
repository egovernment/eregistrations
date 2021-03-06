/** This class should be used as a super class for those section classes
 * which handle forms with more than one fields group.
 */

'use strict';

var memoize               = require('memoizee/plain')
  , validDb               = require('dbjs/valid-dbjs')
  , defineFormSectionBase = require('./form-section-base')
  , defineProgressRule    = require('./lib/progress-rule');

module.exports = memoize(function (db) {
	var FormSectionGroup, FormSectionBase, ProgressRule;
	validDb(db);
	FormSectionBase = defineFormSectionBase(db);
	ProgressRule    = defineProgressRule(db);
	FormSectionGroup = FormSectionBase.extend('FormSectionGroup', {
		// A map of child sections.
		// Note: to add a child section you should define a type on sections map.
		// Example: BusinessProcess.prototype.dataForms.map.groupSection.sections.define('myChild', {
		// type: db.ChildClass, nested: true })
		sections: {
			type: db.Object,
			nested: true
		},
		applicableSections: {
			multiple: true,
			type: FormSectionBase,
			value: function (_observe) {
				var result = [];
				this.sections.forEach(function (section) {
					if (_observe(section._isApplicable)) result.push(section);
				});
				return result;
			}
		},
		internallyApplicableSections: {
			multiple: true,
			type: FormSectionBase,
			value: function (_observe) {
				var result = [];
				this.applicableSections.forEach(function (section) {
					if (_observe(section._isInternallyApplicable)) result.push(section);
				});
				return result;
			}
		},
		lastEditStamp: {
			value: function (_observe) {
				var res = 0, resolvedResolvent;

				if (this.resolventProperty) {
					resolvedResolvent = this.ensureResolvent(_observe);

					if (!resolvedResolvent) return;

					res = _observe(resolvedResolvent.object['_' + resolvedResolvent.key]._lastModified);
					if (res < 1e6) res = 0; // Ignore model stamps
				}

				this.internallyApplicableSections.forEach(function (section) {
					if (_observe(section._lastEditStamp) > res) res = section.lastEditStamp;
				});

				return res;
			}
		},
		propertyNamesDeep: {
			value: function (_observe) {
				var result = [];
				if (this.resolventProperty) result.push(this.resolventProperty);
				this.sections.forEach(function (section) {
					_observe(section.propertyNamesDeep).forEach(function (property) {
						result.push(property);
					});
				});

				return result;
			}
		},
		hasDisplayableRuleDeep: {
			value: function (_observe) {
				if (_observe(this.progressRules.displayable._size) > 0) return true;

				return this.internallyApplicableSections.some(function (child) {
					return _observe(child._hasDisplayableRuleDeep);
				});
			}
		},
		hasMissingRequiredPropertyNamesDeep: {
			value: function (_observe) {
				if (this.isUnresolved) {
					return this.resolventStatus < 1;
				}

				return this.internallyApplicableSections.some(function (child) {
					return _observe(child._hasMissingRequiredPropertyNamesDeep);
				});
			}
		},
		hasFilledPropertyNamesDeep: {
			value: function (_observe) {
				if (this.isResolventFilled(_observe)) return true;

				return this.internallyApplicableSections.some(function (child) {
					return _observe(child._hasFilledPropertyNamesDeep);
				});
			}
		},
		toJSON: { value: function (ignore) {
			var result = this.commonToJSON();
			if (this.resolventProperty) {
				result.fields = [this.master.resolveSKeyPath(this.resolventProperty)
					.ownDescriptor.fieldToJSON()];
			}
			if (!this.isUnresolved) {
				var sections = [];
				this.internallyApplicableSections.forEach(function (section) {
					if (section.hasFilledPropertyNamesDeep) sections.push(section.toJSON());
				});
				if (sections.length) result.sections = sections;
			}
			return result;
		} },
		toWebServiceJSON: { value: function (options) {
			var fields = {}, resolventDescriptor, wsValue, sectionFields, opts, includeFullMeta;
			opts = Object(options);
			includeFullMeta = opts.includeFullMeta;
			if (this.resolventProperty) {
				resolventDescriptor = this.master.resolveSKeyPath(this.resolventProperty).ownDescriptor;
				if (!resolventDescriptor.isValueEmpty()) {
					wsValue = resolventDescriptor.fieldToWebServiceJSON();
					fields[wsValue.name] = includeFullMeta ? wsValue : wsValue.value;
				}
			}
			if (!this.isUnresolved) {
				this.internallyApplicableSections.forEach(function (section) {
					if (section.hasFilledPropertyNamesDeep) {
						sectionFields = section.toWebServiceJSON(opts);
						Object.keys(sectionFields).forEach(function (fieldName) {
							fields[fieldName] = sectionFields[fieldName];
						});
					}
				});
			}

			return fields;
		} },

		toMetaDataJSON: {
			value: function (ignore) {
				var result = [];
				this.sections.forEach(function (section) {
					result = result.concat(section.toMetaDataJSON());
				}, this);

				return result;
			}
		},
		hasSplitForms: {
			type: db.Boolean,
			value: false
		},
		hasOnlyTabularChildren: {
			type: db.Boolean,
			value: function (_observe) {
				var db = this.database;
				if (!db.FormEntitiesTable) return false;
				return this.sections.every(function (section) {
					return section instanceof db.FormEntitiesTable;
				});
			}
		}
	});

	FormSectionGroup.prototype.defineProperties({
		toWSSchema: {
			value: function (ignore) {
				if (typeof process === 'undefined') return;
				var schema = { dataForms: [], properties: {} }, sectionSchema = {};
				this.sections.forEach(function (section) {
					sectionSchema = section.toWSSchema();
					if (sectionSchema.dataForms) {
						//dataForms will have to be set via iteration because assign
						//will overwrite existing value of schema dataForms property.
						sectionSchema.dataForms.forEach(function (dataForm) {
							schema.dataForms.push(dataForm);
						}, this);
						delete sectionSchema.dataForms;
					}
					db.Object.deepAssign(schema, sectionSchema);
				}, this);
				return schema;
			}
		}
	});

	FormSectionGroup.prototype.sections._descriptorPrototype_.type = FormSectionBase;

	FormSectionGroup.prototype.progressRules.map.define('subSections', {
		type: ProgressRule,
		nested: true
	});

	FormSectionGroup.prototype.progressRules.map.subSections.setProperties({
		progress: function (_observe) {
			var sum = 0, resolvedResolvent, isResolventExcluded, section;
			section = this.owner.owner.owner;

			if (_observe(section._resolventProperty)) {
				resolvedResolvent = section.ensureResolvent(_observe);

				if (!resolvedResolvent) return 0;

				isResolventExcluded = section.isPropertyExcludedFromStatus(resolvedResolvent, _observe);
				if (_observe(resolvedResolvent.observable) !== _observe(section._resolventValue)) {
					if (isResolventExcluded) return 1;

					if (resolvedResolvent.descriptor.multiple) {
						if (_observe(resolvedResolvent.observable).size) return 1;
					} else {
						if (_observe(resolvedResolvent.observable) != null) return 1;
					}

					return 0;
				}
				if (!isResolventExcluded) {
					++sum;
				}
			}

			_observe(section.internallyApplicableSections).forEach(function (section) {
				sum += (_observe(section._status) * _observe(section._weight));
			});

			if (!this.weight) return 1;

			return sum / this.weight;
		},
		weight: function (_observe) {
			var weightTotal = 0, resolvedResolvent, isResolventExcluded, section;
			section = this.owner.owner.owner;

			if (_observe(section._resolventProperty)) {
				resolvedResolvent = section.ensureResolvent(_observe);

				if (!resolvedResolvent) return 0;

				isResolventExcluded = section.isPropertyExcludedFromStatus(resolvedResolvent, _observe);
				if (_observe(resolvedResolvent.observable) !== _observe(section._resolventValue)) {
					return isResolventExcluded ? 0 : 1;
				}

				if (!isResolventExcluded) {
					++weightTotal;
				}
			}

			_observe(section.internallyApplicableSections).forEach(function (section) {
				weightTotal += _observe(section._weight);
			});

			return weightTotal;
		}
	});

	return FormSectionGroup;
}, { normalizer: require('memoizee/normalizers/get-1')() });
