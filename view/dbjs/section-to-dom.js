'use strict';

var d                   = require('d')
  , resolvePropertyPath = require('dbjs/_setup/utils/resolve-property-path')
  , mano                = require('mano')
  , headersMap          = require('../utils/headers-map')

  , db = mano.db, ns = mano.domjs.ns, File = db.File;

var resolveValue = function (resolved, specialCase) {
	if (specialCase === 'file') return _if(resolved.value._path, thumb(resolved.value));
	if (specialCase === 'constrainedValue') return resolved.value._resolvedValue;
	return resolved.observable;
};

module.exports = Object.defineProperty(db.FormSection.prototype, 'toDOM',
	d(function (document/*, options*/) {
		var self, headerRank, cssClass, options, filteredNames;
		self = this;
		options = Object(arguments[1]);
		headerRank = options.headerRank || 3;
		cssClass   = options.cssClass || 'entity-data-section';
		return ns.section({ class: cssClass },
			ns._if(self._label, [headersMap[headerRank](self._label), ns.hr()]),
			ns.table(
				ns.tbody(
					ns._if(self._resolventProperty, function () {
						var resolvent = resolvePropertyPath(self.master, self.resolventProperty);

						return ns.tr(ns.th(resolvent.descriptor.label), ns.td(resolvent.observable));
					}),
					ns._if(ns.eq(self._isUnresolved, false), function () {
						return ns.list(filteredNames = self.applicablePropertyNames.filter(function (name) {
							var observable = resolvePropertyPath(self.master, name).observable;
							observable.once('change', function (event) { filteredNames.refresh(name); });
							return observable.value != null;
						}), function (name) {
							var resolved = resolvePropertyPath(self.master, name), cond, specialCase;
							if (!resolved.descriptor.required) {
								if ((typeof resolved.value === 'object') && resolved.value.__id__) {
									if (resolved.value instanceof File) {
										cond = resolved.value._path;
										specialCase = 'file';
									} else if (typeof resolved.value.getDescriptor('resolvedValue')._value_
											=== 'function') {
										cond = not(eqSloppy(resolved.value._resolvedValue, null));
										specialCase = 'constrainedValue';
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
								return ns.tr(ns.th(resolved.descriptor.label),
									td(resolveValue(resolved, specialCase)));
							});
						});
					})
				)
			));
	}));
