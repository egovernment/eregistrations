'use strict';

var d                   = require('d')
  , resolvePropertyPath = require('dbjs/_setup/utils/resolve-property-path')
  , mano                = require('mano')
  , headersMap          = require('../utils/headers-map')
  , getPropertyLabel    = require('../utils/get-property-label')
  , defaultResolveValue = require('../utils/default-resolve-value')

  , db                  = mano.db
  , File                = db.File;

module.exports = Object.defineProperty(db.FormSection.prototype, 'toDOM',
	d(function (document/*, options*/) {
		var self         = this
		  , options      = Object(arguments[1])
		  , headerRank   = options.headerRank || 3
		  , cssClass     = options.cssClass || 'entity-data-section'
		  , displayEmptyFields = options.displayEmptyFields
		  , resolveValue = options.customResolveValue || defaultResolveValue
		  , filteredNames;

		return section({ class: cssClass },
			options.disableHeader ? null : _if(self._label, [headersMap[headerRank](self._label)]),
			table(
				tbody(
					_if(self._resolventProperty, function () {
						var resolvent = resolvePropertyPath(self.propertyMaster, self.resolventProperty);

						return tr(th(getPropertyLabel(resolvent)), td(resolvent.observable));
					}),
					_if(eq(self._isUnresolved, false), function () {
						return list(filteredNames = self.applicablePropertyNames.filter(function (name) {
							var resolved   = resolvePropertyPath(self.master, name)
							  , observable = resolved.observable;

							observable.once('change', function (event) { filteredNames.refresh(name); });
							if (options.customFilter) {
								if (!options.customFilter(resolved)) return false;
							}
							if (resolved.descriptor.multiple) {
								observable.value.once('change', function (event) { filteredNames.refresh(name); });
							}
							if (displayEmptyFields) return true;
							if (resolved.descriptor.multiple) return observable.value.size;
							return observable.value != null;
						}), function (name) {
							var resolved = resolvePropertyPath(self.master, name)
							  , isNested = (typeof resolved.value === 'object') && resolved.value
									&& resolved.value.__id__
							  , cond, specialCase;

							if (isNested) {
								if (File && resolved.value instanceof File) {
									specialCase = 'file';
								} else if (typeof resolved.value.getDescriptor('resolvedValue')
										._value_ === 'function') {
									specialCase = 'constrainedValue';
								}
							}

							if (!resolved.descriptor.required) {
								if (isNested) {
									if (specialCase === 'file') {
										cond = resolved.value._path;
									} else if (specialCase === 'constrainedValue') {
										cond = not(eqSloppy(resolved.value._resolvedValue, null));
									} else {
										cond = not(eqSloppy(resolved.observable, null));
									}
								} else {
									cond = not(eqSloppy(resolved.observable, null));
								}
							} else {
								cond = true;
							}
							return _if(cond, function () {
								return tr(th(getPropertyLabel(resolved)),
									td(resolveValue(resolved, specialCase)));
							});
						});
					})
				)
			));
	}));
