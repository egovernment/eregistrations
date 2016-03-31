/** Base class for all sections. */

'use strict';

var memoize             = require('memoizee/plain')
  , validDb             = require('dbjs/valid-dbjs')
  , defineStringLine    = require('dbjs-ext/string/string-line')
  , defineUInteger      = require('dbjs-ext/number/integer/u-integer')
  , definePercentage    = require('dbjs-ext/number/percentage')
  , defineProgressRules = require('./lib/progress-rules')
  , _                   = require('mano').i18n.bind('Model: FormSectionBase');

module.exports = memoize(function (db) {
	var StringLine, Percentage, UInteger, ProgressRules, FormSectionBase;
	validDb(db);
	ProgressRules = defineProgressRules(db);
	db.Object.defineProperties({
		getFormApplicablePropName: { type: db.Function, value: function (prop) {
			return 'is' + prop[0].toUpperCase() + prop.slice(1) + 'FormApplicable';
		} },
		getApplicablePropName: { type: db.Function, value: function (prop) {
			return 'is' + prop[0].toUpperCase() + prop.slice(1) + 'Applicable';
		} }
	});
	UInteger   = defineUInteger(db);
	StringLine = defineStringLine(db);
	Percentage = definePercentage(db);
	FormSectionBase = db.Object.extend('FormSectionBase', {
		progressRules: { type: ProgressRules, nested: true },
		label: { type: StringLine, required: true },
		// Usage example: tabs
		shortLabel: { type: StringLine, value: function () {
			return this.label;
		} },
		// Optional explanation text.
		legend: { type: db.String },
		// When isApplicable !== true the section will not be visible in the view
		// (rendered with default generator)
		isApplicable: { type: db.Boolean, required: true, value: true },
		// The master for property paths resolution
		propertyMaster: { type: db.Object, value: function () {
			var owner;
			if (this.propertyMasterType) {
				// we take first owner who is a person
				owner = this.owner;
				while (owner && !this.propertyMasterType.is(owner)) {
					owner = owner.owner;
				}
				if (!owner) {
					throw new Error("Could not find propertyMaster of type " +
						this.propertyMasterType.__id__
						+ " for section: " + this.__id__ + ". " +
						"This is most likely due to invalid section's definition.");
				}
				return owner;
			}
			return this.master;
		} },
		// Setup for type to check against in propertyMaster's owner search
		propertyMasterType: { type: db.Base },
		// A percentage of completion of fields covered by the section
		status: { type: Percentage, required: true, value: function (_observe) {
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
		} },
		// The weight of the section status. It is used to determine weighed status across sections.
		// It is usually equal to number of fields covered by the section.
		weight: { type: UInteger, required: true, value: function (_observe) {
			if (this.isUnresolved) {
				return this.resolventWeight;
			}
			return _observe(this.progressRules._weight) + this.resolventWeight;
		} },
		// The value upon which resolventProperty is resolved.
		// Section is visible when section.master[section.resolventProperty] === section.resolventValue
		// See also resolventProperty.
		resolventValue: { type: db.Base },
		// Used to overwrite default message which is shown through view/components/incomplete-form-nav.
		onIncompleteMessage: { type: StringLine },
		isUnresolved: { type: db.Boolean, value: function (_observe) {
			var resolvedResolvent;

			if (!this.resolventProperty) return false;

			resolvedResolvent = this.ensureResolvent(_observe);
			if (!resolvedResolvent) {
				return false;
			}

			return _observe(resolvedResolvent.observable) !== this.resolventValue;
		} },
		resolventStatus: {
			type: UInteger,
			value: function (_observe) {
				var isResolventExcluded, resolvedResolvent;

				if (!this.resolventProperty) return 1;

				resolvedResolvent = this.ensureResolvent(_observe);
				if (!resolvedResolvent) {
					return 0;
				}

				isResolventExcluded = this.isPropertyExcludedFromStatus(resolvedResolvent, _observe);
				if (isResolventExcluded) return 1;

				if (_observe(resolvedResolvent.observable) !== _observe(this.resolventValue)) {
					if (resolvedResolvent.descriptor.multiple) {
						if (_observe(resolvedResolvent.observable).size) return 1;
					} else {
						if (_observe(resolvedResolvent.observable) != null) return 1;
					}
					return 0;
				}

				return 1;
			}
		},
		resolventWeight: {
			type: UInteger,
			value: function (_observe) {
				var isResolventExcluded, resolvedResolvent;

				if (!this.resolventProperty) return 0;

				resolvedResolvent = this.ensureResolvent(_observe);
				if (!resolvedResolvent) {
					return 0;
				}

				isResolventExcluded = this.isPropertyExcludedFromStatus(resolvedResolvent, _observe);
				if (isResolventExcluded) return 0;

				return 1;
			}
		},
		isPropertyExcludedFromStatus: { type: db.Function, value: function (resolved, _observe) {
			var File = this.database.File, NestedMap = this.database.NestedMap;

			// Not required, then not validated
			if (!resolved.descriptor.required || this.excludedFromStatus.has(resolved.key)) {
				return true;
			}

			if (!this.excludedFromStatusIfFilled.has(resolved.key)) {
				// Multiple value: not excluded
				if (resolved.descriptor.multiple) return false;
				// No underlying value on prototype: not excluded
				if (Object.getPrototypeOf(resolved.object).get(resolved.key) == null) return false;
				// Nested file: not excluded
				if (File && (resolved.value instanceof File)) return false;
				// Nested map: not excluded
				if (NestedMap && (resolved.key === 'map') && (resolved.object instanceof NestedMap)) {
					return false;
				}
				// Constrained value: not excluded
				if (resolved.value && (typeof resolved.value === 'object') && resolved.value.__id__ &&
						(typeof resolved.value.getDescriptor('resolvedValue')._value_ === 'function')) {
					return false;
				}
			}

			// In that case we just validate that it's not shadowed by null
			// or in case of multiple that it has at least one item
			if (resolved.descriptor.multiple) {
				if (_observe(resolved.observable).size) return true;
			} else {
				if (_observe(resolved.observable) != null) return true;
			}
		} },
		ensureResolvent: { type: db.Function, value: function (observeFunction) {
			var resolved = this.master.resolveSKeyPath(this.resolventProperty, observeFunction);

			if (!resolved) {
				return;
			}
			if (!resolved.object.hasPropertyDefined(resolved.key)) {
				throw new Error('Could not find resolventProperty: ' + this.resolventProperty);
			}

			return resolved;
		} },
		lastEditStamp: { type: UInteger, value: 0 },
		lastEditDate: { type: db.DateTime, value: function () {
			return this.lastEditStamp / 1000;
		} },
		excludedFromStatus: { type: StringLine, multiple: true },
		// A multiple for which you can pass names of the properties you want excluded from
		// status calculation if they were already provided for the form (for example from guide).
		excludedFromStatusIfFilled: { type: StringLine, multiple: true },
		// The url to which the the form created around the section will be submitted.
		actionUrl: { type: StringLine, required: true },
		// Used to hide and show section depending on a value of certain property.
		// Set name of the property as value of resolventProperty.
		// Section is visible when section.master[section.resolventProperty] === section.resolventValue
		resolventProperty: { type: StringLine },
		// Sometimes we need to react to payment state
		isOnlinePaymentDependent: { type: db.Boolean, value: false },
		// Disables a payment dependent section when there is/was an online payment
		isDisabled: { type: db.Boolean, value: function (_observe) {
			return this.isOnlinePaymentDependent &&
				_observe(this.master.costs._isOnlinePaymentInitialized);
		} },
		// Message to be shown when the section has been disabled
		disabledMessage: {
			type: db.String,
			value: _("Section is disabled because online payment transaction has " +
				"already been made or it's in progress")
		},
		// Checks weather at least one progress rule of this section or it's children
		// is displayable (invalid and has a message)
		hasDisplayableRuleDeep: {
			type: db.Boolean
		},
		// Checks weather at least one of fields of this section or it's children
		// has a missing value in this
		hasMissingRequiredPropertyNamesDeep: {
			type: db.Boolean
		},
		// Resolves collection of which section is part of
		resolveParentCollection: {
			type: db.Function,
			value: function (ignore) {
				if (!this.owner || !this.owner.owner) return null;
				if ((this.owner.key === 'sections') && this.owner.owner.applicableSections) {
					return this.owner.owner.applicableSections;
				}
				if ((this.owner.key === 'map') && this.owner.owner.applicable) {
					return this.owner.owner.applicable;
				}
			}
		}
	});

	FormSectionBase.prototype.defineProperties({
		// Next section (applicable only if section is one of sub-sections on section group)
		nextSection: {
			type: FormSectionBase,
			value: function (_observe) {
				var sections = this.resolveParentCollection(), nextSection, seen;
				if (!sections) return null;
				if (!_observe(sections).has(this)) return null;
				sections.some(function (section) {
					if (seen) {
						nextSection = section;
						return true;
					}
					if (this === section) seen = true;
				}, this);
				return nextSection;
			}
		},
		// Previous section (applicable only if section is one of sub-sections on section group)
		previousSection: {
			type: FormSectionBase,
			value: function (_observe) {
				var sections = this.resolveParentCollection(), previousSection;
				if (!sections) return null;
				if (!_observe(sections).has(this)) return null;
				sections.some(function (section) {
					if (this === section) return true;
					previousSection = section;
				}, this);
				return previousSection;
			}
		}
	});

	return FormSectionBase;
}, { normalizer: require('memoizee/normalizers/get-1')() });
