/** Base class for all sections. */

'use strict';

var memoize          = require('memoizee/plain')
  , validDb          = require('dbjs/valid-dbjs')
  , defineStringLine = require('dbjs-ext/string/string-line')
  , defineUInteger   = require('dbjs-ext/number/integer/u-integer')
  , definePercentage = require('dbjs-ext/number/percentage')
  , defineProgressRules     = require('./lib/progress-rules');

module.exports = memoize(function (db) {
	var StringLine, Percentage, UInteger, ProgressRules;
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
	return db.Object.extend('FormSectionBase', {
		progressRules: { type: ProgressRules, nested: true },
		label: { type: StringLine, required: true },
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
		status: { type: Percentage, required: true, value: 1 },
		// The weight of the section status. It is used to determine weighed status across sections.
		// It is usually equal to number of fields covered by the section.
		weight: { type: UInteger, required: true, value: 0 },
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
			if (!resolved.descriptor.required) return true;

			// Forced to be excluded
			if (this.excludedFromStatusIfFilled.has(resolved.key) ||

			// or excluded by fact of having a default value on prototype
					(!resolved.descriptor.multiple &&
						(Object.getPrototypeOf(resolved.object).get(resolved.key) != null) &&
						((!File || !(resolved.value instanceof File)) &&
						(!NestedMap || (resolved.key !== 'map') || !(resolved.object instanceof NestedMap))
							))) {

				// In that case we just validate that it's not shadowed by null
				// or in case of multiple that it has at least one item
				if (resolved.descriptor.multiple) {
					if (_observe(resolved.observable).size) return true;
				} else {
					if (_observe(resolved.observable) != null) return true;
				}
			}

			return false;
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
		// A multiple for which you can pass names of the properties you want excluded from
		// status calculation if they were already provided for the form (for example from guide).
		excludedFromStatusIfFilled: { type: StringLine, multiple: true },
		// The url to which the the form created around the section will be submitted.
		actionUrl: { type: StringLine, required: true },
		// Used to hide and show section depending on a value of certain property.
		// Set name of the property as value of resolventProperty.
		// Section is visible when section.master[section.resolventProperty] === section.resolventValue
		resolventProperty: { type: StringLine }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
